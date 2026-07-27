import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Payment as MPPayment, Preference as MPPreference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { mercadopago, mpErrorMessage, autoReturnFor } from "@/lib/mercadopago";

const bodySchema = z.object({
  method: z.enum(["pix", "checkout_pro"]),
  payerName: z.string().trim().min(1).max(120),
  payerEmail: z.string().trim().email(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ giftId: string }> }) {
  const { giftId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { method, payerName, payerEmail } = parsed.data;

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) {
    return NextResponse.json({ error: "Presente não encontrado" }, { status: 404 });
  }
  if (gift.type !== "CASH_QUOTA") {
    return NextResponse.json({ error: "Este presente não é uma cota em dinheiro" }, { status: 400 });
  }
  if (gift.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Este presente já foi presenteado" }, { status: 409 });
  }
  if (!gift.price) {
    return NextResponse.json({ error: "Presente sem valor definido" }, { status: 400 });
  }

  const amount = Number(gift.price);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const paymentRecord = await prisma.payment.create({
    data: {
      giftId: gift.id,
      amount: gift.price,
      payerName,
      status: "PENDING",
    },
  });

  try {
    if (method === "pix") {
      const payment = new MPPayment(mercadopago);
      const result = await payment.create({
        body: {
          transaction_amount: amount,
          description: gift.title,
          payment_method_id: "pix",
          payer: { email: payerEmail, first_name: payerName },
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          external_reference: paymentRecord.id,
        },
      });

      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { mpPaymentId: String(result.id) },
      });

      const txData = result.point_of_interaction?.transaction_data;
      return NextResponse.json({
        paymentId: paymentRecord.id,
        method: "pix",
        qrCode: txData?.qr_code ?? null,
        qrCodeBase64: txData?.qr_code_base64 ?? null,
        status: result.status,
      });
    }

    const preference = new MPPreference(mercadopago);
    const result = await preference.create({
      body: {
        items: [
          {
            id: gift.id,
            title: gift.title,
            quantity: 1,
            unit_price: amount,
            currency_id: "BRL",
          },
        ],
        payer: { name: payerName, email: payerEmail },
        back_urls: {
          success: `${appUrl}/presentes?status=success`,
          pending: `${appUrl}/presentes?status=pending`,
          failure: `${appUrl}/presentes?status=failure`,
        },
        auto_return: autoReturnFor(appUrl),
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        external_reference: paymentRecord.id,
      },
    });

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: { mpPreferenceId: result.id },
    });

    return NextResponse.json({
      paymentId: paymentRecord.id,
      method: "checkout_pro",
      initPoint: result.init_point,
    });
  } catch (err) {
    await prisma.payment.update({ where: { id: paymentRecord.id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ error: mpErrorMessage(err, "Erro ao iniciar pagamento") }, { status: 502 });
  }
}
