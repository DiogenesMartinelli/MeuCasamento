"use client";

import { useActionState, useState } from "react";
import { updateRsvpTheme, type RsvpThemeFormState } from "@/lib/actions/rsvp-theme";
import {
  RSVP_ANIMATED_BACKGROUND_OPTIONS,
  RSVP_BACKGROUND_TYPE_OPTIONS,
  RSVP_CONFIRM_ANIMATION_OPTIONS,
  RSVP_FONT_OPTIONS,
  RSVP_LIGHTING_EFFECT_OPTIONS,
  getRsvpFontClass,
} from "@/lib/rsvp-theme";
import { getSectionStyle, getCardStyle, getTextStyle, getMutedTextStyle, getAccentButtonStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPickerField } from "@/components/admin/color-picker-field";
import { GradientColorField } from "@/components/admin/gradient-color-field";
import { ImageField } from "@/components/admin/image-field";
import { VideoField } from "@/components/admin/video-field";
import { OptionPicker } from "@/components/admin/option-picker";
import { StringLights, Sparkles, AnimatedBackground, LightingOverlay } from "@/components/public/rsvp-decorations";
import { cn } from "@/lib/utils";
import type {
  RsvpAnimatedBackground,
  RsvpBackgroundType,
  RsvpConfirmAnimation,
  RsvpFontFamily,
  RsvpLightingEffect,
  RsvpTheme,
} from "@/generated/prisma/client";

const initialState: RsvpThemeFormState = {};

const CONFIRMED_FONT_OPTIONS = [
  { value: "INHERIT" as RsvpFontFamily, label: "Igual à etapa anterior" },
  ...RSVP_FONT_OPTIONS.filter((o) => o.value !== "INHERIT"),
];

export function RsvpThemeForm({ rsvpTheme }: { rsvpTheme: RsvpTheme | null }) {
  const [state, formAction, isPending] = useActionState(updateRsvpTheme, initialState);
  const [enabled, setEnabled] = useState(rsvpTheme?.useCustomStyle ?? false);
  const [backgroundType, setBackgroundType] = useState<RsvpBackgroundType>(rsvpTheme?.backgroundType ?? "INHERIT");
  const [animatedBackground, setAnimatedBackground] = useState<RsvpAnimatedBackground>(
    rsvpTheme?.animatedBackground ?? "PETALS",
  );
  const [lightingEffect, setLightingEffect] = useState<RsvpLightingEffect>(rsvpTheme?.lightingEffect ?? "NONE");
  const [confirmAnimation, setConfirmAnimation] = useState<RsvpConfirmAnimation>(
    rsvpTheme?.confirmAnimation ?? "NONE",
  );
  const [showSparkles, setShowSparkles] = useState(rsvpTheme?.showSparkles ?? false);
  const [showStringLights, setShowStringLights] = useState(rsvpTheme?.showStringLights ?? false);
  const [glassCards, setGlassCards] = useState(rsvpTheme?.glassCards ?? false);
  const [fontFamily, setFontFamily] = useState<RsvpFontFamily>(rsvpTheme?.fontFamily ?? "INHERIT");
  const [confirmedFontFamily, setConfirmedFontFamily] = useState<RsvpFontFamily>(
    rsvpTheme?.confirmedFontFamily ?? "INHERIT",
  );

  const [colors, setColors] = useState<SiteColors>({
    accentColor: rsvpTheme?.accentColor,
    backgroundColor: rsvpTheme?.backgroundColor,
    backgroundGradientTo: rsvpTheme?.backgroundGradientTo,
    textColor: rsvpTheme?.textColor,
    mutedTextColor: rsvpTheme?.mutedTextColor,
    cardBackgroundColor: rsvpTheme?.cardBackgroundColor,
    cardBackgroundGradientTo: rsvpTheme?.cardBackgroundGradientTo,
    borderColor: rsvpTheme?.borderColor,
  });
  const [confirmedMessage, setConfirmedMessage] = useState(rsvpTheme?.confirmedMessage ?? "");
  const [confirmedTextColor, setConfirmedTextColor] = useState(rsvpTheme?.confirmedTextColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(rsvpTheme?.backgroundImageUrl ?? null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(rsvpTheme?.backgroundVideoUrl ?? null);

  function updateColor(key: keyof SiteColors) {
    return (value: string) => setColors((prev) => ({ ...prev, [key]: value || null }));
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form action={formAction} className="flex flex-col gap-6">
        <label className="flex items-center gap-2 rounded-lg border p-4 text-sm font-medium">
          <input
            type="checkbox"
            name="useCustomStyle"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Personalizar estilo do RSVP
        </label>
        <p className="-mt-4 text-xs text-muted-foreground">
          Desligado, a tela de confirmação de presença usa exatamente o mesmo estilo do site. Ligue
          para dar um visual (e ambientação) próprios só para o RSVP.
        </p>

        <div className={cn("flex flex-col gap-6", !enabled && "hidden")}>
          <div className="flex flex-col gap-1.5">
            <Label>Fundo do RSVP</Label>
            <OptionPicker
              name="backgroundType"
              options={RSVP_BACKGROUND_TYPE_OPTIONS}
              defaultValue={backgroundType}
              onChange={setBackgroundType}
            />
            {backgroundType === "COLOR" && (
              <div className="mt-2 max-w-xs">
                <GradientColorField
                  name="backgroundColor"
                  gradientName="backgroundGradientTo"
                  ariaLabel="Escolher cor de fundo do RSVP"
                  defaultValue={colors.backgroundColor}
                  defaultGradientValue={colors.backgroundGradientTo}
                  onChange={updateColor("backgroundColor")}
                  onGradientChange={updateColor("backgroundGradientTo")}
                />
              </div>
            )}
            {backgroundType === "IMAGE" && (
              <div className="mt-2">
                <ImageField
                  name="backgroundImage"
                  label="Imagem de fundo (aceita GIF/WebP animado)"
                  currentUrl={backgroundImageUrl}
                  onPreview={setBackgroundImageUrl}
                />
              </div>
            )}
            {backgroundType === "VIDEO" && (
              <div className="mt-2">
                <VideoField currentUrl={backgroundVideoUrl} onUploaded={setBackgroundVideoUrl} />
              </div>
            )}
            {backgroundType === "ANIMATED" && (
              <div className="mt-2">
                <OptionPicker
                  name="animatedBackground"
                  options={RSVP_ANIMATED_BACKGROUND_OPTIONS}
                  defaultValue={animatedBackground}
                  onChange={setAnimatedBackground}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Cor de destaque</Label>
              <ColorPickerField
                name="accentColor"
                ariaLabel="Escolher cor de destaque do RSVP"
                defaultValue={colors.accentColor}
                onChange={updateColor("accentColor")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cor do texto</Label>
              <ColorPickerField
                name="textColor"
                ariaLabel="Escolher cor do texto do RSVP"
                defaultValue={colors.textColor}
                onChange={updateColor("textColor")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cor do texto secundário</Label>
              <ColorPickerField
                name="mutedTextColor"
                ariaLabel="Escolher cor do texto secundário do RSVP"
                defaultValue={colors.mutedTextColor}
                onChange={updateColor("mutedTextColor")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Cor dos cards</Label>
              <GradientColorField
                name="cardBackgroundColor"
                gradientName="cardBackgroundGradientTo"
                ariaLabel="Escolher cor de fundo dos cards do RSVP"
                defaultValue={colors.cardBackgroundColor}
                defaultGradientValue={colors.cardBackgroundGradientTo}
                onChange={updateColor("cardBackgroundColor")}
                onGradientChange={updateColor("cardBackgroundGradientTo")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cor das bordas</Label>
              <ColorPickerField
                name="borderColor"
                ariaLabel="Escolher cor das bordas do RSVP"
                defaultValue={colors.borderColor}
                onChange={updateColor("borderColor")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Fonte do texto</Label>
            <OptionPicker name="fontFamily" options={RSVP_FONT_OPTIONS} defaultValue={fontFamily} onChange={setFontFamily} />
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">Depois que o convidado confirma</p>
            <div className="flex flex-col gap-1.5">
              <Label>Mensagem</Label>
              <Textarea
                name="confirmedMessage"
                rows={2}
                placeholder="Presença confirmada! Vemos vocês lá 🎉"
                value={confirmedMessage}
                onChange={(e) => setConfirmedMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Mostrada só quando o convidado confirma presença (não a recusa). Em branco usa a mensagem padrão.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Cor do texto</Label>
                <ColorPickerField
                  name="confirmedTextColor"
                  ariaLabel="Escolher cor do texto após confirmação"
                  defaultValue={confirmedTextColor}
                  onChange={setConfirmedTextColor}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fonte</Label>
                <OptionPicker
                  name="confirmedFontFamily"
                  options={CONFIRMED_FONT_OPTIONS}
                  defaultValue={confirmedFontFamily}
                  onChange={setConfirmedFontFamily}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Decorações</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showSparkles"
                checked={showSparkles}
                onChange={(e) => setShowSparkles(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Pingos de luz
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showStringLights"
                checked={showStringLights}
                onChange={(e) => setShowStringLights(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Lâmpadas (varal de luz)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="glassCards"
                checked={glassCards}
                onChange={(e) => setGlassCards(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Efeito vitrificado nos cards
            </label>

            <div className="mt-2 flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Efeito de iluminação</Label>
              <OptionPicker
                name="lightingEffect"
                options={RSVP_LIGHTING_EFFECT_OPTIONS}
                defaultValue={lightingEffect}
                onChange={setLightingEffect}
                size="sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Animação ao confirmar presença</Label>
              <OptionPicker
                name="confirmAnimation"
                options={RSVP_CONFIRM_ANIMATION_OPTIONS}
                defaultValue={confirmAnimation}
                onChange={setConfirmAnimation}
                size="sm"
              />
            </div>
          </div>
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p className="text-sm text-green-600 dark:text-green-400">RSVP salvo!</p>}

        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Salvando..." : "Salvar RSVP"}
        </Button>
      </form>

      <div className="hidden lg:block">
        <div className="sticky top-6">
          <RsvpThemePreview
            enabled={enabled}
            backgroundType={backgroundType}
            animatedBackground={animatedBackground}
            backgroundImageUrl={backgroundImageUrl}
            backgroundVideoUrl={backgroundVideoUrl}
            lightingEffect={lightingEffect}
            showSparkles={showSparkles}
            showStringLights={showStringLights}
            colors={{ ...colors, glassCards }}
            fontFamily={fontFamily}
            confirmedFontFamily={confirmedFontFamily}
            confirmedTextColor={confirmedTextColor}
            confirmedMessage={confirmedMessage}
          />
        </div>
      </div>
    </div>
  );
}

function RsvpThemePreview({
  enabled,
  backgroundType,
  animatedBackground,
  backgroundImageUrl,
  backgroundVideoUrl,
  lightingEffect,
  showSparkles,
  showStringLights,
  colors,
  fontFamily,
  confirmedFontFamily,
  confirmedTextColor,
  confirmedMessage,
}: {
  enabled: boolean;
  backgroundType: RsvpBackgroundType;
  animatedBackground: RsvpAnimatedBackground;
  backgroundImageUrl: string | null;
  backgroundVideoUrl: string | null;
  lightingEffect: RsvpLightingEffect;
  showSparkles: boolean;
  showStringLights: boolean;
  colors: SiteColors;
  fontFamily: RsvpFontFamily;
  confirmedFontFamily: RsvpFontFamily;
  confirmedTextColor: string;
  confirmedMessage: string;
}) {
  const [showConfirmed, setShowConfirmed] = useState(false);
  const headingFont = getRsvpFontClass(fontFamily, "font-sans font-semibold");
  const confirmedFont = getRsvpFontClass(
    confirmedFontFamily === "INHERIT" ? fontFamily : confirmedFontFamily,
    headingFont,
  );
  const frameStyle = enabled
    ? getCardStyle(colors.cardBackgroundColor, colors.borderColor, colors.cardBackgroundGradientTo, colors.glassCards)
    : undefined;
  const hasFrame = !!frameStyle;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="flex items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div
          className="relative flex min-h-[380px] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-10 text-center"
          style={enabled ? getSectionStyle(colors.backgroundColor, colors.textColor, colors.backgroundGradientTo) : undefined}
        >
          {enabled && backgroundType === "IMAGE" && backgroundImageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            />
          )}
          {enabled && backgroundType === "VIDEO" && backgroundVideoUrl && (
            <video
              src={backgroundVideoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          )}
          {(enabled && (backgroundType === "IMAGE" || backgroundType === "VIDEO")) && (
            <div className="absolute inset-0 bg-black/35" />
          )}
          {enabled && backgroundType === "ANIMATED" && <AnimatedBackground preset={animatedBackground} />}
          {enabled && <LightingOverlay effect={lightingEffect} />}
          {enabled && showStringLights && <StringLights />}
          {enabled && showSparkles && <Sparkles />}

          <div
            className={cn("relative z-10 flex w-full max-w-xs flex-col items-center gap-4", hasFrame && "rounded-xl p-6")}
            style={frameStyle}
          >
            {!showConfirmed ? (
              <>
                <h1 className={cn("text-xl font-semibold", headingFont)} style={getTextStyle(colors.textColor)}>
                  Confirme sua presença
                </h1>
                <div className={cn("w-full rounded-lg px-3 py-2 text-xs", !hasFrame && "border")}>
                  Convidado Exemplo
                </div>
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  style={getAccentButtonStyle(colors.accentColor)}
                  onClick={() => setShowConfirmed(true)}
                >
                  Confirmar presença
                </button>
              </>
            ) : (
              <p
                className={cn("text-lg font-medium", confirmedFont)}
                style={confirmedTextColor ? { color: confirmedTextColor } : getTextStyle(colors.textColor)}
              >
                {confirmedMessage || "Presença confirmada! Vemos vocês lá 🎉"}
              </p>
            )}
            <button
              type="button"
              className="text-xs underline opacity-70"
              style={getMutedTextStyle(colors.mutedTextColor)}
              onClick={() => setShowConfirmed((v) => !v)}
            >
              {showConfirmed ? "Ver etapa de confirmação" : "Ver etapa depois de confirmar"}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Prévia aproximada da tela de RSVP — o resultado real pode variar um pouco conforme o tamanho da tela.
      </p>
    </div>
  );
}
