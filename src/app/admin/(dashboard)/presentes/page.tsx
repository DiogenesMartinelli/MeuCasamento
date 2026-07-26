import Link from "next/link";
import Image from "next/image";
import { getCurrentAccount } from "@/lib/current-account";
import { prisma } from "@/lib/prisma";
import { deleteGift } from "@/lib/actions/gifts";
import { GiftDialog } from "@/components/admin/gift-dialog";
import { GiftStatusToggle } from "@/components/admin/gift-status-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function GiftsAdminPage() {
  const account = await getCurrentAccount();
  const events = await prisma.event.findMany({
    where: { accountId: account!.id },
    orderBy: { date: "asc" },
  });
  const rawGifts = await prisma.gift.findMany({
    where: { accountId: account!.id },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });
  const gifts = rawGifts.map((gift) => ({ ...gift, price: gift.price === null ? null : Number(gift.price) }));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Lista de presentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Produtos de lojas parceiras ou cotas em dinheiro via Pix/cartão.
          </p>
        </div>
        {events.length > 0 && <GiftDialog events={events} trigger={<Button>Novo presente</Button>} />}
      </div>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Cadastre um evento em{" "}
          <Link href="/admin/eventos" className="underline">
            Eventos
          </Link>{" "}
          antes de adicionar presentes.
        </p>
      ) : gifts.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nenhum presente cadastrado ainda.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <Card key={gift.id} className="overflow-hidden py-0">
              {gift.imageUrl && (
                <div className="relative h-36 w-full bg-muted">
                  <Image src={gift.imageUrl} alt={gift.title} fill className="object-cover" />
                </div>
              )}
              <CardContent className="flex flex-col gap-2 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{gift.title}</p>
                  <Badge variant={gift.status === "PURCHASED" ? "secondary" : "default"}>
                    {gift.status === "PURCHASED" ? "Recebido" : "Disponível"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{gift.event.name}</p>
                {gift.type === "CASH_QUOTA" && gift.price && (
                  <p className="text-sm font-semibold">{currency.format(Number(gift.price))}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <GiftDialog
                    events={events}
                    gift={gift}
                    trigger={
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    }
                  />
                  <GiftStatusToggle giftId={gift.id} status={gift.status} />
                  <DeleteButton
                    action={deleteGift.bind(null, gift.id)}
                    confirmMessage={`Excluir o presente "${gift.title}"?`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
