import Link from "next/link";
import { getCurrentAccount } from "@/lib/current-account";
import { prisma } from "@/lib/prisma";
import { getGuestFamilies } from "@/lib/queries/guest-families";
import { deleteGuest } from "@/lib/actions/guests";
import { GuestDialog } from "@/components/admin/guest-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GuestStatus } from "@/generated/prisma/client";

const STATUS_VARIANT: Record<GuestStatus, "default" | "secondary" | "outline"> = {
  CONFIRMED: "default",
  DECLINED: "outline",
  PENDING: "secondary",
};
const STATUS_LABEL: Record<GuestStatus, string> = {
  CONFIRMED: "Confirmado",
  DECLINED: "Recusado",
  PENDING: "Pendente",
};

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
      ) : families.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nenhum convidado cadastrado ainda.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {families.map((family) => (
            <Card key={family.familyToken}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">{family.label}</p>
                  <div className="flex items-center gap-2">
                    <CopyLinkButton
                      url={`${appUrl}/c/${account!.slug}/rsvp/${family.familyToken}`}
                    />
                    <GuestDialog
                      events={events}
                      families={familyOptions}
                      defaultFamilyToken={family.familyToken}
                      trigger={
                        <Button variant="outline" size="sm">
                          + Membro
                        </Button>
                      }
                    />
                  </div>
                </div>
                <ul className="mt-3 divide-y">
                  {family.members.map((guest) => (
                    <li key={guest.id} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-xs text-muted-foreground">{guest.event.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANT[guest.status]}>
                          {STATUS_LABEL[guest.status]}
                        </Badge>
                        <GuestDialog
                          events={events}
                          families={familyOptions}
                          guest={guest}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          }
                        />
                        <DeleteButton
                          action={() => deleteGuest(guest.id)}
                          confirmMessage={`Remover ${guest.name}?`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
