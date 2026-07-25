import { getCurrentAccount } from "@/lib/current-account";
import { prisma } from "@/lib/prisma";
import { deleteEvent } from "@/lib/actions/events";
import { EventDialog } from "@/components/admin/event-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

export default async function EventsPage() {
  const account = await getCurrentAccount();
  const events = await prisma.event.findMany({
    where: { accountId: account!.id },
    orderBy: { date: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ex: Casamento, Chá de Panela, Despedida de solteiro...
          </p>
        </div>
        <EventDialog trigger={<Button>Novo evento</Button>} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum evento cadastrado ainda.</p>
        )}
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-muted-foreground">{dateFormatter.format(event.date)}</p>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <EventDialog event={event} trigger={<Button variant="outline" size="sm">Editar</Button>} />
                <DeleteButton
                  action={() => deleteEvent(event.id)}
                  confirmMessage={`Excluir o evento "${event.name}"? Convidados e presentes vinculados também serão excluídos.`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
