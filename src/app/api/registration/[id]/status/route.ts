import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payment = await prisma.registrationPayment.findUnique({
    where: { id },
    select: { status: true, usedAt: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ status: payment.status, used: !!payment.usedAt });
}
