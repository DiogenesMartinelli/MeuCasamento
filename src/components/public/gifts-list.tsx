"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GiftCard } from "./gift-card";
import { getMutedTextStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import type { SerializedGift } from "@/lib/queries/gifts";
import type { Event, GiftCardShape } from "@/generated/prisma/client";

export function GiftsList({
  gifts,
  events,
  colors,
  shape,
}: {
  gifts: SerializedGift[];
  events: Event[];
  colors?: SiteColors;
  shape?: GiftCardShape;
}) {
  const [eventId, setEventId] = useState<string>("all");

  const filtered = useMemo(
    () => (eventId === "all" ? gifts : gifts.filter((gift) => gift.eventId === eventId)),
    [gifts, eventId],
  );

  return (
    <div>
      {events.length > 1 && (
        <Tabs value={eventId} onValueChange={setEventId} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {events.map((event) => (
              <TabsTrigger key={event.id} value={event.id}>
                {event.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground" style={getMutedTextStyle(colors?.mutedTextColor)}>
          Nenhum presente cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gift) => (
            <GiftCard key={gift.id} gift={gift} colors={colors} shape={shape} />
          ))}
        </div>
      )}
    </div>
  );
}
