import Link from "next/link";
import { getCurrentAccount } from "@/lib/current-account";
import { prisma } from "@/lib/prisma";
import { getGuestFamilies } from "@/lib/queries/guest-families";
import { GuestDialog } from "@/components/admin/guest-dialog";
import { GuestFamiliesList } from "@/components/admin/guest-families-list";
import { Button } from "@/components/ui/button";

export default async function GuestsPage() {
  const account = await getCurrentAccount();
  const events = await prisma.event.findMany({
    where: { accountId: account!.id },
    orderBy: { date: "asc" },
  });
  const families = await getGuestFamilies(account!.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const familyOptions = families.map((family) => ({ token: family.familyToken, label: family.label }));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Convidados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize convidados por família - cada família recebe um único link de confirmação.
          </p>
        </div>
        {events.length > 0 && (
          <GuestDialog events={events} families={familyOptions} trigger={<Button>Novo convidado</Button>} />
        )}
      </div>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Cadastre um evento em{" "}
          <Link href="/admin/eventos" className="underline">
            Eventos
          </Link>{" "}
          antes de adicionar convidados.
        </p>
      ) : (
        <GuestFamiliesList
          families={families}
          events={events}
          familyOptions={familyOptions}
          appUrl={appUrl}
          slug={account!.slug}
          coupleName={account?.siteSettings?.coupleName || "Nós"}
          photoUrl={account?.siteSettings?.profileImageUrl}
        />
      )}
    </div>
  );
}
