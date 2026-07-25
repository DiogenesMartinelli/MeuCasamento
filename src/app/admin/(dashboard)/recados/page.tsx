import { getCurrentAccount } from "@/lib/current-account";
import { getAllMessages } from "@/lib/queries/messages";
import { MessageRow } from "@/components/admin/message-row";
import { Card, CardContent } from "@/components/ui/card";

export default async function MessagesAdminPage() {
  const account = await getCurrentAccount();
  const messages = await getAllMessages(account!.id);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Mural de recados</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Modere as mensagens deixadas pelos convidados no site.
      </p>

      <Card className="mt-8">
        <CardContent className="py-2">
          {messages.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nenhum recado recebido ainda.</p>
          ) : (
            messages.map((message) => <MessageRow key={message.id} message={message} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
