import type { CSSProperties } from "react";
import type { GiftCardShape } from "@/generated/prisma/client";

/** The couple's optional custom color palette, as stored on SiteSettings. */
export type SiteColors = {
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  mutedTextColor?: string | null;
  cardBackgroundColor?: string | null;
  borderColor?: string | null;
};

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

/** Inline style overriding a section's background (and readable text color), if set. */
export function getSectionStyle(
  backgroundColor?: string | null,
  textColor?: string | null,
): CSSProperties | undefined {
  if (!backgroundColor && !textColor) return undefined;
  return {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(textColor ? { color: textColor } : { color: backgroundColor ? pickTextColor(backgroundColor) : undefined }),
  };
}

/** Inline style overriding text/heading color, if set. */
export function getTextStyle(textColor?: string | null): CSSProperties | undefined {
  if (!textColor) return undefined;
  return { color: textColor };
}

/** Inline style overriding secondary/muted text color, if set. */
export function getMutedTextStyle(mutedTextColor?: string | null): CSSProperties | undefined {
  if (!mutedTextColor) return undefined;
  return { color: mutedTextColor };
}

/** Inline style overriding a card/surface's background and border color, if set. */
export function getCardStyle(
  cardBackgroundColor?: string | null,
  borderColor?: string | null,
): CSSProperties | undefined {
  if (!cardBackgroundColor && !borderColor) return undefined;
  return {
    ...(cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : {}),
    ...(borderColor ? { borderColor } : {}),
  };
}

export const GIFT_CARD_SHAPE_CLASS: Record<GiftCardShape, { image: string; button: string }> = {
  SQUARE: { image: "rounded-none", button: "rounded-none" },
  ROUNDED: { image: "rounded-lg", button: "rounded-md" },
  SOFT: { image: "rounded-2xl", button: "rounded-xl" },
  PILL: { image: "rounded-3xl", button: "rounded-full" },
  OVAL: { image: "rounded-[50%]", button: "rounded-full" },
};

export const GIFT_CARD_SHAPE_OPTIONS: { id: GiftCardShape; label: string }[] = [
  { id: "SQUARE", label: "Quadrado" },
  { id: "ROUNDED", label: "Arredondado" },
  { id: "SOFT", label: "Suave" },
  { id: "PILL", label: "Redondo" },
  { id: "OVAL", label: "Oval" },
];
