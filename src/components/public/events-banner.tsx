import Image from "next/image";
import type { Event } from "@/generated/prisma/client";

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
}: {
  events: Event[];
  bannerImageUrl?: string | null;
}) {
  if (events.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16">
      {bannerImageUrl && (
        <>
          <Image src={bannerImageUrl} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
        </>
      )}
      <div
        className={`relative z-10 mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:flex-row sm:flex-wrap sm:justify-center ${
          bannerImageUrl ? "text-white" : ""
        }`}
      >
        {events.map((event) => (
          <div
            key={event.id}
            className="min-w-[240px] flex-1 rounded-xl border border-white/20 bg-black/20 p-6 text-center backdrop-blur-sm"
          >
            <h3 className="font-serif text-2xl font-semibold">{event.name}</h3>
            <p className="mt-2 text-sm opacity-90">{dateFormatter.format(event.date)}</p>
            {event.description && <p className="mt-3 text-sm opacity-80">{event.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
