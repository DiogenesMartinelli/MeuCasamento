import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAccount } from "@/lib/current-account";
import { signOut } from "@/lib/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await getCurrentAccount();
  if (!account) redirect("/admin/onboarding");

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <aside className="shrink-0 border-b bg-muted/30 p-4 sm:w-64 sm:border-b-0 sm:border-r sm:p-6">
        <Link href={`/c/${account.slug}`} target="_blank" className="mb-6 block">
          <p className="font-serif text-lg font-semibold">
            {account.siteSettings?.coupleName || "Meu Casamento"}
          </p>
          <p className="text-xs text-muted-foreground underline underline-offset-2">
            /c/{account.slug} ↗
          </p>
        </Link>
        <AdminNav className="flex-row flex-wrap sm:flex-col sm:flex-nowrap" />
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
            Sair
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-4 sm:p-10">{children}</main>
    </div>
  );
}
