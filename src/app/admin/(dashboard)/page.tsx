import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { getCurrentAccount } from "@/lib/current-account";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RenewButton } from "@/components/admin/renew-button";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  const stats = await getDashboardStats(account!.id);
  const daysLeft = account?.expiresAt ? differenceInCalendarDays(account.expiresAt, new Date()) : null;

  const cards = [
    {
      title: "Convidados confirmados",
      value: `${stats.guestsConfirmed} / ${stats.guestsTotal}`,
      href: "/admin/convidados",
    },
    { title: "Recusaram presença", value: stats.guestsDeclined, href: "/admin/convidados" },
    {
      title: "Presentes recebidos",
      value: `${stats.giftsPurchased} / ${stats.giftsTotal}`,
      href: "/admin/presentes",
    },
    {
      title: "Recados recebidos",
      value: stats.messagesTotal,
      href: "/admin/recados",
      hint: stats.messagesHidden > 0 ? `${stats.messagesHidden} ocultos` : undefined,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Painel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Visão geral do site de {account?.siteSettings?.coupleName || "vocês"}.
      </p>

      {account?.expiresAt && daysLeft !== null && (
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium">
              {daysLeft > 0
                ? `Seu plano vence em ${dateFormatter.format(account.expiresAt)} (${daysLeft} dias)`
                : "Seu plano venceu - renove para continuar usando a plataforma"}
            </p>
            <p className="text-xs text-muted-foreground">
              A renovação estende o acesso por mais 12 meses, mantendo todos os dados.
            </p>
          </div>
          <RenewButton />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{card.value}</p>
                {card.hint && <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
