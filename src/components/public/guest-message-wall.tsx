import type { GuestMessage } from "@/generated/prisma/client";

export function GuestMessageWall({ messages }: { messages: GuestMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Seja o primeiro a deixar um recado para os noivos!
      </p>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="break-inside-avoid rounded-lg border bg-card p-4 shadow-sm"
        >
          <p className="whitespace-pre-wrap text-sm text-card-foreground">{message.content}</p>
          <p className="mt-3 text-xs font-medium text-muted-foreground">— {message.authorName}</p>
        </div>
      ))}
    </div>
  );
}
