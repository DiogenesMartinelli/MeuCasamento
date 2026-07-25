import Link from "next/link";
import { getCurrentAccount } from "@/lib/current-account";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  const stats = await getDashboardStats(account!.id);

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
