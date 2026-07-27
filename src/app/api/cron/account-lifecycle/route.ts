import { NextRequest, NextResponse } from "next/server";
import {
  sendTwoMonthReminders,
  sendOneMonthReminders,
  processExpiredAccounts,
} from "@/lib/account-lifecycle";

/**
 * Runs daily via Vercel Cron (see vercel.json). Sends the 2-month / 1-month expiry
 * reminders, then exports + emails + deletes any account whose 12 months are up.
 *
 * This can delete real accounts, so it fails closed: without CRON_SECRET configured,
 * every request is rejected rather than allowed through.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const twoMonthReminders = await sendTwoMonthReminders();
  const oneMonthReminders = await sendOneMonthReminders();
  const expiredProcessed = await processExpiredAccounts();

  return NextResponse.json({ twoMonthReminders, oneMonthReminders, expiredProcessed });
}
