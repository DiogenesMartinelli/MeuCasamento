import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Every admin page calls getCurrentAccount() itself on top of the dashboard layout
// already calling it - without request memoization that's two Supabase
// auth.getUser() network round-trips and two Prisma queries per page load instead
// of one. cache() dedupes repeated calls within the same request.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Resolves the Account owned by the logged-in user. Returns null if none exists yet (needs onboarding). */
export const getCurrentAccount = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const account = await prisma.account.findUnique({
    where: { ownerUserId: user.id },
    include: { siteSettings: true, rsvpTheme: true },
  });

  return account;
});

/** Same as getCurrentAccount but redirects to onboarding when the account doesn't exist yet. */
export async function requireCurrentAccount() {
  const account = await getCurrentAccount();
  if (!account) redirect("/admin/onboarding");
  return account;
}
