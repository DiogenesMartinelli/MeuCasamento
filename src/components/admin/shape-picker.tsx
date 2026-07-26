"use client";

import { useState } from "react";
import { GIFT_CARD_SHAPE_OPTIONS, GIFT_CARD_SHAPE_CLASS } from "@/lib/accent-color";
import { cn } from "@/lib/utils";
import type { GiftCardShape } from "@/generated/prisma/client";

export function ShapePicker({ defaultValue }: { defaultValue: GiftCardShape }) {
  const [selected, setSelected] = useState<GiftCardShape>(defaultValue);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="giftCardShape" value={selected} />
      <div className="flex gap-3">
        {GIFT_CARD_SHAPE_OPTIONS.map((option) => {
          const active = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:border-foreground/40",
                active ? "border-primary ring-2 ring-primary/30" : "border-border",
              )}
            >
              <span
                className={cn("h-8 w-14 bg-foreground/70", GIFT_CARD_SHAPE_CLASS[option.id].image)}
                aria-hidden
              />
              <span className="text-xs">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
