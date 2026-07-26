import type { SiteTemplate } from "@/generated/prisma/client";

export type SiteTemplateConfig = {
  id: SiteTemplate;
  label: string;
  description: string;
  /** Small color swatches shown in the admin picker, light → dark. */
  swatch: [string, string, string];
  headingFont: string;
  /** Optional decorative glyph rendered under the couple's name. */
  ornament: string;
  heroOverlay: string;
  accentText: string;
  sectionBg: string;
  cardClass: string;
  buttonRadius: string;
};

export const SITE_TEMPLATES: SiteTemplateConfig[] = [
  {
    id: "CLASSIC",
    label: "Clássico",
    description: "Serifado elegante, tons de marfim e dourado. Atemporal.",
    swatch: ["#faf7f0", "#d4b483", "#3f2e1a"],
    headingFont: "font-playfair",
    ornament: "❦",
    heroOverlay: "bg-black/50",
    accentText: "text-amber-200",
    sectionBg: "bg-stone-50",
    cardClass: "border-stone-200 bg-white",
    buttonRadius: "rounded-md",
  },
  {
    id: "MODERN",
    label: "Moderno",
    description: "Sans-serif ousado, alto contraste, layout limpo.",
    swatch: ["#ffffff", "#111827", "#2563eb"],
    headingFont: "font-sans font-bold tracking-tight",
    ornament: "",
    heroOverlay: "bg-black/65",
    accentText: "text-blue-300",
    sectionBg: "bg-white",
    cardClass: "border-neutral-900 bg-white rounded-none",
    buttonRadius: "rounded-none",
  },
  {
    id: "RUSTIC",
    label: "Rústico",
    description: "Tons terrosos e quentes, com toque artesanal.",
    swatch: ["#f2e8d5", "#b5651d", "#3e2411"],
    headingFont: "font-playfair italic",
    ornament: "—  —",
    heroOverlay: "bg-amber-950/55",
    accentText: "text-orange-200",
    sectionBg: "bg-orange-50",
    cardClass: "border-orange-200 bg-[#fdf6ec]",
    buttonRadius: "rounded-sm",
  },
  {
    id: "BOHO",
    label: "Boho",
    description: "Tons pastéis, formas arredondadas, clima leve.",
    swatch: ["#fdf2f8", "#f4a8b8", "#6b7d5f"],
    headingFont: "font-playfair",
    ornament: "✦",
    heroOverlay: "bg-rose-950/40",
    accentText: "text-rose-200",
    sectionBg: "bg-rose-50",
    cardClass: "border-rose-200 bg-white rounded-3xl",
    buttonRadius: "rounded-full",
  },
  {
    id: "MINIMAL",
    label: "Minimalista",
    description: "Muito espaço em branco, tipografia fina, monocromático.",
    swatch: ["#ffffff", "#e5e5e5", "#171717"],
    headingFont: "font-sans font-light tracking-widest",
    ornament: "",
    heroOverlay: "bg-black/40",
    accentText: "text-white/70",
    sectionBg: "bg-white",
    cardClass: "border-neutral-200 bg-white shadow-none",
    buttonRadius: "rounded-none",
  },
  {
    id: "ROMANTIC",
    label: "Romântico",
    description: "Caligrafia delicada, tons de rosa e vinho, florido.",
    swatch: ["#fff1f2", "#e11d48", "#4c0519"],
    headingFont: "font-dancing-script text-6xl sm:text-7xl",
    ornament: "❀",
    heroOverlay: "bg-rose-950/50",
    accentText: "text-rose-200",
    sectionBg: "bg-rose-50/60",
    cardClass: "border-rose-100 bg-white rounded-2xl",
    buttonRadius: "rounded-full",
  },
  {
    id: "CUSTOM",
    label: "Outro",
    description: "Ponto de partida neutro: escolha você mesmo todas as cores do site.",
    swatch: ["#f5f5f5", "#a3a3a3", "#171717"],
    headingFont: "font-sans font-semibold",
    ornament: "",
    heroOverlay: "bg-black/50",
    accentText: "text-white/80",
    sectionBg: "bg-background",
    cardClass: "border-border bg-card",
    buttonRadius: "rounded-md",
  },
];

export function getSiteTemplate(id: SiteTemplate | null | undefined): SiteTemplateConfig {
  return SITE_TEMPLATES.find((t) => t.id === id) ?? SITE_TEMPLATES[0];
}
