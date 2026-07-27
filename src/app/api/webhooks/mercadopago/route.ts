import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { addMonths } from "date-fns";
import { Payment as MPPayment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { mercadopago } from "@/lib/mercadopago";

type LocalPaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

const STATUS_MAP: Record<string, LocalPaymentStatus> = {
  approved: "APPROVED",
  pending: "PENDING",
  in_process: "PENDING",
  rejected: "REJECTED",
  cancelled: "CANCELLED",
  refunded: "CANCELLED",
  charged_back: "CANCELLED",
};

function isValidSignature(request: NextRequest, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // not configured yet - allow through in early dev setup

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const queryDataId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const queryType = url.searchParams.get("type") || url.searchParams.get("topic");

  let body: { type?: string; data?: { id?: string } } | null = null;
  try {
    body = await request.json();
  } catch {
    // MP sometimes sends notifications with no body, relying on query params only
  }

  const paymentId = queryDataId || body?.data?.id;
  const resourceType = queryType || body?.type;

  if (resourceType !== "payment" || !paymentId) {
    return NextResponse.json({ received: true });
  }

  if (!isValidSignature(request, String(paymentId))) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const paymentApi = new MPPayment(mercadopago);
  const mpPayment = await paymentApi.get({ id: paymentId });

  const externalReference = mpPayment.external_reference;
  if (!externalReference) {
    return NextResponse.json({ received: true });
  }

  const newStatus = STATUS_MAP[mpPayment.status ?? ""] ?? "PENDING";

  const giftPayment = await prisma.payment.findUnique({
    where: { id: externalReference },
    include: { gift: true },
  });

  if (giftPayment) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: giftPayment.id },
        data: { status: newStatus, mpPaymentId: String(mpPayment.id) },
      });

      if (newStatus === "APPROVED" && giftPayment.gift.status !== "PURCHASED") {
        await tx.gift.update({ where: { id: giftPayment.giftId }, data: { status: "PURCHASED" } });
      }
    });

    return NextResponse.json({ received: true });
  }

  const registrationPayment = await prisma.registrationPayment.findUnique({
    where: { id: externalReference },
    include: { account: true },
  });

  if (registrationPayment) {
    await prisma.registrationPayment.update({
      where: { id: registrationPayment.id },
      data: { status: newStatus, mpPaymentId: String(mpPayment.id) },
    });

    // Renewal payments (accountId set) push the 12-month expiry forward as soon as
    // they're approved - unlike new signups, there's no separate "complete" step since
    // the Supabase user and Account already exist.
    if (newStatus === "APPROVED" && registrationPayment.account && !registrationPayment.usedAt) {
      const base =
        registrationPayment.account.expiresAt && registrationPayment.account.expiresAt > new Date()
          ? registrationPayment.account.expiresAt
          : new Date();

      await prisma.$transaction([
        prisma.account.update({
          where: { id: registrationPayment.account.id },
          data: {
            expiresAt: addMonths(base, 12),
            reminderTwoMonthsSentAt: null,
            reminderOneMonthSentAt: null,
          },
        }),
        prisma.registrationPayment.update({
          where: { id: registrationPayment.id },
          data: { usedAt: new Date() },
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
