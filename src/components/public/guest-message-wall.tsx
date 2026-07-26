import type { GuestMessage } from "@/generated/prisma/client";
import type { SiteTemplateConfig } from "@/lib/site-templates";
import { cn } from "@/lib/utils";

export function GuestMessageWall({
  messages,
  template,
}: {
  messages: GuestMessage[];
  template: SiteTemplateConfig;
}) {
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
          className={cn("break-inside-avoid rounded-lg border p-4 shadow-sm", template.cardClass)}
        >
          <p className="whitespace-pre-wrap text-sm text-card-foreground">{message.content}</p>
          <p className="mt-3 text-xs font-medium text-muted-foreground">— {message.authorName}</p>
        </div>
      ))}
    </div>
  );
}
