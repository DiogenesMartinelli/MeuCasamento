import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { status: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ status: payment.status });
}
