import type { GuestMessage } from "@/generated/prisma/client";
import type { SiteTemplateConfig } from "@/lib/site-templates";
import { getCardStyle, getMutedTextStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import { cn } from "@/lib/utils";

export function GuestMessageWall({
  messages,
  template,
  colors,
}: {
  messages: GuestMessage[];
  template: SiteTemplateConfig;
  colors?: SiteColors;
}) {
  const mutedStyle = getMutedTextStyle(colors?.mutedTextColor);

  if (messages.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground" style={mutedStyle}>
        Seja o primeiro a deixar um recado para os noivos!
      </p>
    );
  }

  const cardStyle = getCardStyle(colors?.cardBackgroundColor, colors?.borderColor);

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("break-inside-avoid rounded-lg border p-4 shadow-sm", template.cardClass)}
          style={cardStyle}
        >
          <p className="whitespace-pre-wrap text-sm text-card-foreground">{message.content}</p>
          <p className="mt-3 text-xs font-medium text-muted-foreground" style={mutedStyle}>
            — {message.authorName}
          </p>
        </div>
      ))}
    </div>
  );
}
