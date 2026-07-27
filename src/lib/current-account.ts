import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Resolves the Account owned by the logged-in user. Returns null if none exists yet (needs onboarding). */
export async function getCurrentAccount() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const account = await prisma.account.findUnique({
    where: { ownerUserId: user.id },
    include: { siteSettings: true, rsvpTheme: true },
  });

  return account;
}

/** Same as getCurrentAccount but redirects to onboarding when the account doesn't exist yet. */
export async function requireCurrentAccount() {
  const account = await getCurrentAccount();
  if (!account) redirect("/admin/onboarding");
  return account;
}
