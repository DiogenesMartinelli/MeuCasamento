import Image from "next/image";
import type { Event } from "@/generated/prisma/client";
import type { SiteTemplateConfig } from "@/lib/site-templates";
import { getCardStyle, getMutedTextStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function EventsBanner({
  events,
  bannerImageUrl,
  template,
  colors,
}: {
  events: Event[];
  bannerImageUrl?: string | null;
  template: SiteTemplateConfig;
  colors?: SiteColors;
}) {
  if (events.length === 0) return null;

  const cardStyle = bannerImageUrl
    ? undefined
    : getCardStyle(colors?.cardBackgroundColor, colors?.borderColor, colors?.cardBackgroundGradientTo);
  const mutedStyle = bannerImageUrl ? undefined : getMutedTextStyle(colors?.mutedTextColor);

  return (
    <section className={cn("relative overflow-hidden py-16", !bannerImageUrl && template.sectionBg)}>
      {bannerImageUrl && (
        <>
          <Image src={bannerImageUrl} alt="" fill className="object-cover" sizes="100vw" />
          <div className={cn("absolute inset-0", template.heroOverlay)} />
        </>
      )}
      <div
        className={cn(
          "relative z-10 mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:flex-row sm:flex-wrap sm:justify-center",
          bannerImageUrl && "text-white",
        )}
      >
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "min-w-[240px] flex-1 rounded-xl border p-6 text-center backdrop-blur-sm",
              bannerImageUrl ? "border-white/20 bg-black/20" : template.cardClass,
            )}
            style={cardStyle}
          >
            <h3 className={cn("text-2xl font-semibold", template.headingFont)}>{event.name}</h3>
            <p className="mt-2 text-sm opacity-90" style={mutedStyle}>
              {dateFormatter.format(event.date)}
            </p>
            {event.description && (
              <p className="mt-3 text-sm opacity-80" style={mutedStyle}>
                {event.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
