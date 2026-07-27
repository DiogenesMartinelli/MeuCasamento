import type { CSSProperties } from "react";
import type { GiftCardShape } from "@/generated/prisma/client";

/** The couple's optional custom color palette, as stored on SiteSettings. */
export type SiteColors = {
  accentColor?: string | null;
  backgroundColor?: string | null;
  /** When set alongside backgroundColor, renders a gradient instead of a flat color. */
  backgroundGradientTo?: string | null;
  textColor?: string | null;
  mutedTextColor?: string | null;
  cardBackgroundColor?: string | null;
  /** Same idea as backgroundGradientTo, but for card surfaces. */
  cardBackgroundGradientTo?: string | null;
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

/** A flat color, or (when a second stop is given) a diagonal gradient between the two. */
function backgroundFill(color?: string | null, gradientTo?: string | null): CSSProperties {
  if (color && gradientTo) {
    return { backgroundImage: `linear-gradient(135deg, ${color}, ${gradientTo})` };
  }
  if (color) return { backgroundColor: color };
  return {};
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

/** Inline style overriding a section's background (flat or gradient) and readable text color. */
export function getSectionStyle(
  backgroundColor?: string | null,
  textColor?: string | null,
  backgroundGradientTo?: string | null,
): CSSProperties | undefined {
  if (!backgroundColor && !textColor) return undefined;
  return {
    ...backgroundFill(backgroundColor, backgroundGradientTo),
    ...(textColor ? { color: textColor } : { color: backgroundColor ? pickTextColor(backgroundColor) : undefined }),
  };
}

/**
 * Inline style for the hero area behind the couple's name (and their photo, if uploaded).
 * Only used when there's no background photo - falls back to a neutral dark gradient so
 * the white hero text stays readable when the couple hasn't set a custom color either.
 */
export function getHeroFallbackStyle(
  backgroundColor?: string | null,
  backgroundGradientTo?: string | null,
): CSSProperties {
  if (backgroundColor || backgroundGradientTo) {
    return backgroundFill(backgroundColor, backgroundGradientTo ?? backgroundColor);
  }
  return { backgroundImage: "linear-gradient(to bottom, #262626, #0a0a0a)" };
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

/** Inline style overriding a card/surface's background (flat or gradient) and border color. */
export function getCardStyle(
  cardBackgroundColor?: string | null,
  borderColor?: string | null,
  cardBackgroundGradientTo?: string | null,
): CSSProperties | undefined {
  if (!cardBackgroundColor && !borderColor) return undefined;
  return {
    ...backgroundFill(cardBackgroundColor, cardBackgroundGradientTo),
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
