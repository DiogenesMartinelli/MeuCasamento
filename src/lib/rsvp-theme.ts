import type { SiteColors } from "@/lib/accent-color";
import type {
  RsvpAnimatedBackground,
  RsvpBackgroundType,
  RsvpConfirmAnimation,
  RsvpFontFamily,
  RsvpLightingEffect,
  RsvpTheme,
} from "@/generated/prisma/client";

export const RSVP_BACKGROUND_TYPE_OPTIONS: { value: RsvpBackgroundType; label: string }[] = [
  { value: "INHERIT", label: "Igual ao site" },
  { value: "COLOR", label: "Cor / degradê" },
  { value: "IMAGE", label: "Imagem" },
  { value: "VIDEO", label: "Vídeo" },
  { value: "ANIMATED", label: "Animação pronta" },
];

export const RSVP_ANIMATED_BACKGROUND_OPTIONS: { value: RsvpAnimatedBackground; label: string }[] = [
  { value: "PETALS", label: "Pétalas caindo" },
  { value: "SNOW", label: "Neve" },
  { value: "STARS", label: "Céu estrelado" },
  { value: "FIREFLIES", label: "Vaga-lumes" },
];

export const RSVP_LIGHTING_EFFECT_OPTIONS: { value: RsvpLightingEffect; label: string }[] = [
  { value: "NONE", label: "Nenhum" },
  { value: "GLOW", label: "Brilho suave" },
  { value: "SPOTLIGHT", label: "Holofote" },
  { value: "CANDLELIGHT", label: "Luz de vela" },
];

export const RSVP_FONT_OPTIONS: { value: RsvpFontFamily; label: string }[] = [
  { value: "INHERIT", label: "Igual ao site" },
  { value: "SANS", label: "Moderna" },
  { value: "SERIF", label: "Elegante" },
  { value: "SCRIPT", label: "Caligráfica" },
];

export const RSVP_CONFIRM_ANIMATION_OPTIONS: { value: RsvpConfirmAnimation; label: string }[] = [
  { value: "NONE", label: "Nenhuma" },
  { value: "CONFETTI", label: "Confete" },
  { value: "HEARTS", label: "Corações" },
  { value: "FIREWORKS", label: "Fogos" },
];

// Only the typeface, never a size - the caller already sets a size class (text-xl,
// text-3xl, ...) and mixing a size in here fights it via tailwind-merge, silently
// dropping the caller's size and blowing the heading up to whatever's set here.
const RSVP_FONT_CLASS: Record<Exclude<RsvpFontFamily, "INHERIT">, string> = {
  SANS: "font-sans font-semibold",
  SERIF: "font-playfair",
  SCRIPT: "font-dancing-script",
};

/** Maps a font choice to its Tailwind class, falling back to the site template's heading font when unset/INHERIT. */
export function getRsvpFontClass(
  font: RsvpFontFamily | null | undefined,
  fallback: string,
): string {
  if (!font || font === "INHERIT") return fallback;
  return RSVP_FONT_CLASS[font];
}

/**
 * Merges the RSVP-specific palette on top of the site's palette. When custom RSVP
 * styling is off, the RSVP page keeps inheriting the site's colors exactly as
 * before this feature existed. When it's on, each field falls back to the site's
 * value individually, so a couple can override just the accent color and leave
 * everything else matching the main site.
 */
export function resolveRsvpColors(siteColors: SiteColors, rsvpTheme: RsvpTheme | null | undefined): SiteColors {
  if (!rsvpTheme?.useCustomStyle) return siteColors;

  return {
    accentColor: rsvpTheme.accentColor ?? siteColors.accentColor,
    backgroundColor: rsvpTheme.backgroundColor ?? siteColors.backgroundColor,
    backgroundGradientTo: rsvpTheme.backgroundGradientTo ?? siteColors.backgroundGradientTo,
    textColor: rsvpTheme.textColor ?? siteColors.textColor,
    mutedTextColor: rsvpTheme.mutedTextColor ?? siteColors.mutedTextColor,
    cardBackgroundColor: rsvpTheme.cardBackgroundColor ?? siteColors.cardBackgroundColor,
    cardBackgroundGradientTo: rsvpTheme.cardBackgroundGradientTo ?? siteColors.cardBackgroundGradientTo,
    borderColor: rsvpTheme.borderColor ?? siteColors.borderColor,
    glassCards: rsvpTheme.glassCards,
  };
}
