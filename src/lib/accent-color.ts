import type { CSSProperties } from "react";
import type { GiftCardShape } from "@/generated/prisma/client";

/** Picks readable text color (black/white) for a given hex background. */
function pickTextColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#171717" : "#ffffff";
}

/** Inline style overriding a filled button's color with the couple's custom accent, if set. */
export function getAccentButtonStyle(accentColor?: string | null): CSSProperties | undefined {
  if (!accentColor) return undefined;
  return {
    backgroundColor: accentColor,
    borderColor: accentColor,
    color: pickTextColor(accentColor),
  };
}

export const GIFT_CARD_SHAPE_CLASS: Record<GiftCardShape, { image: string; button: string }> = {
  SQUARE: { image: "rounded-none", button: "rounded-none" },
  ROUNDED: { image: "rounded-lg", button: "rounded-md" },
  PILL: { image: "rounded-3xl", button: "rounded-full" },
};

export const GIFT_CARD_SHAPE_OPTIONS: { id: GiftCardShape; label: string }[] = [
  { id: "SQUARE", label: "Quadrado" },
  { id: "ROUNDED", label: "Arredondado" },
  { id: "PILL", label: "Redondo" },
];
