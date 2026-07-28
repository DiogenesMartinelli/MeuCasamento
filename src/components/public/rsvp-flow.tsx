"use client";

import { useState, useTransition } from "react";
import { respondRsvp } from "@/lib/actions/rsvp";
import { Button } from "@/components/ui/button";
import { GiftsList } from "@/components/public/gifts-list";
import { getAccentButtonStyle, getCardStyle, getTextStyle, getMutedTextStyle, getSectionStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import { getAnimatedBackgroundStyle, getRsvpFontClass } from "@/lib/rsvp-theme";
import { AnimatedBackground, ConfirmBurst, LightingOverlay, Sparkles, StringLights } from "@/components/public/rsvp-decorations";
import { cn } from "@/lib/utils";
import type { SerializedGift } from "@/lib/queries/gifts";
import type { Event, GiftCardShape, GuestStatus, RsvpTheme } from "@/generated/prisma/client";

type Step = "respond" | "thanks" | "ask-gift" | "gifts" | "done";

type FamilyGuest = { id: string; name: string; event: { name: string } };

export function RsvpFlow({
  familyToken,
  slug,
  coupleName,
  familyGuests,
  initialStatus,
  declineMessage,
  gifts,
  events,
  headingFont,
  sectionBgClass,
  cardClass,
  giftCardShape,
  colors,
  askGiftIntent = true,
  rsvpTheme,
}: {
  familyToken: string;
  slug: string;
  coupleName: string;
  familyGuests: FamilyGuest[];
  initialStatus: GuestStatus;
  declineMessage: string;
  gifts: SerializedGift[];
  events: Event[];
  headingFont: string;
  sectionBgClass: string;
  cardClass: string;
  giftCardShape?: GiftCardShape;
  colors?: SiteColors;
  askGiftIntent?: boolean;
  rsvpTheme?: RsvpTheme | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<GuestStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(initialStatus === "PENDING" ? "respond" : "thanks");
  const [justConfirmed, setJustConfirmed] = useState(false);
  const accentStyle = getAccentButtonStyle(colors?.accentColor);
  const mutedStyle = getMutedTextStyle(colors?.mutedTextColor);

  const useCustomBg = !!rsvpTheme?.useCustomStyle;
  const backgroundType = useCustomBg ? rsvpTheme?.backgroundType ?? "INHERIT" : "INHERIT";
  const usesFlatBackground = backgroundType === "INHERIT" || backgroundType === "COLOR";
  const usesMedia = backgroundType === "IMAGE" || backgroundType === "VIDEO";
  const isAnimated = backgroundType === "ANIMATED";
  const needsLightText = usesMedia && !colors?.textColor;

  // For a ready-made animated background, the couple's own color/gradient becomes
  // the backdrop under the particles when set - otherwise the preset falls back to
  // its own backdrop, so petals/snow/fireflies always render against something with
  // enough contrast instead of the page's plain default background.
  const animatedBackdropStyle = isAnimated
    ? getAnimatedBackgroundStyle(
        rsvpTheme?.animatedBackground,
        colors?.backgroundColor,
        colors?.textColor,
        colors?.backgroundGradientTo,
      )
    : undefined;

  const resolvedHeadingFont = getRsvpFontClass(useCustomBg ? rsvpTheme?.fontFamily : undefined, headingFont);
  const confirmedFontSource =
    useCustomBg && rsvpTheme?.confirmedFontFamily && rsvpTheme.confirmedFontFamily !== "INHERIT"
      ? rsvpTheme.confirmedFontFamily
      : useCustomBg
        ? rsvpTheme?.fontFamily
        : undefined;
  const confirmedFont = getRsvpFontClass(confirmedFontSource, resolvedHeadingFont);
  const confirmedTextStyle =
    useCustomBg && rsvpTheme?.confirmedTextColor
      ? { color: rsvpTheme.confirmedTextColor }
      : getTextStyle(colors?.textColor);
  const confirmedMessage = (useCustomBg && rsvpTheme?.confirmedMessage) || "Presença confirmada! Vemos vocês lá 🎉";

  // "Vitrificação" wraps the whole confirmation panel, not individual elements inside
  // it - a single frame is the correct read of "glass card", not a glass list plus
  // plain buttons floating separately.
  const frameStyle = useCustomBg
    ? getCardStyle(colors?.cardBackgroundColor, colors?.borderColor, colors?.cardBackgroundGradientTo, colors?.glassCards)
    : undefined;
  const hasFrame = !!frameStyle;

  function handle(next: "CONFIRMED" | "DECLINED") {
    setError(null);
    startTransition(async () => {
      try {
        await respondRsvp(familyToken, slug, next);
        setStatus(next);
        setStep("thanks");
        if (next === "CONFIRMED") setJustConfirmed(true);
      } catch {
        setError("Não foi possível registrar sua resposta. Tente novamente.");
      }
    });
  }

  return (
    <div
      className={cn("relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-16", usesFlatBackground && sectionBgClass)}
      style={
        usesFlatBackground
          ? getSectionStyle(colors?.backgroundColor, colors?.textColor, colors?.backgroundGradientTo)
          : isAnimated
            ? animatedBackdropStyle
            : undefined
      }
    >
      {useCustomBg && backgroundType === "IMAGE" && rsvpTheme?.backgroundImageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${rsvpTheme.backgroundImageUrl})` }}
        />
      )}
      {useCustomBg && backgroundType === "VIDEO" && rsvpTheme?.backgroundVideoUrl && (
        <video
          src={rsvpTheme.backgroundVideoUrl}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {useCustomBg && usesMedia && <div className="absolute inset-0 z-0 bg-black/40" />}
      {useCustomBg && isAnimated && rsvpTheme?.animatedBackground && (
        <AnimatedBackground preset={rsvpTheme.animatedBackground} />
      )}
      {useCustomBg && rsvpTheme?.lightingEffect && rsvpTheme.lightingEffect !== "NONE" && (
        <LightingOverlay effect={rsvpTheme.lightingEffect} />
      )}
      {useCustomBg && rsvpTheme?.showStringLights && <StringLights />}
      {useCustomBg && rsvpTheme?.showSparkles && <Sparkles />}
      {useCustomBg && (
        <ConfirmBurst variant={rsvpTheme?.confirmAnimation ?? "NONE"} active={justConfirmed} />
      )}

      <div className={cn("relative z-10 w-full", needsLightText && "text-white", step === "gifts" ? "max-w-6xl" : "max-w-lg")}>
        {step === "gifts" ? (
          <>
            <h1
              className={cn("mb-6 text-center text-3xl font-semibold", resolvedHeadingFont)}
              style={getTextStyle(colors?.textColor)}
            >
              Lista de Presentes
            </h1>
            <GiftsList gifts={gifts} events={events} colors={colors} shape={giftCardShape} />
          </>
        ) : (
          <div
            key={step}
            className={cn(
              "flex flex-col items-center gap-8 text-center animate-rsvp-step-in",
              hasFrame && "rounded-2xl p-8 sm:p-10",
            )}
            style={frameStyle}
          >
            {step === "respond" && (
              <>
                <div>
                  <h1 className={cn("text-3xl font-semibold", resolvedHeadingFont)}>Confirme sua presença</h1>
                  <p className="mt-2 opacity-80" style={mutedStyle}>
                    {coupleName}
                  </p>
                </div>

                <ul className={cn("w-full divide-y rounded-lg", hasFrame ? "divide-white/15" : cn("border", cardClass))}>
                  {familyGuests.map((guest) => (
                    <li key={guest.id} className="flex items-center justify-between px-4 py-3">
                      <span className="font-medium">{guest.name}</span>
                      <span className="text-xs text-muted-foreground">{guest.event.name}</span>
                    </li>
                  ))}
                </ul>

                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <Button style={accentStyle} onClick={() => handle("CONFIRMED")} disabled={isPending}>
                    Confirmar presença
                  </Button>
                  <Button variant="outline" onClick={() => handle("DECLINED")} disabled={isPending}>
                    Não poderei ir
                  </Button>
                </div>
              </>
            )}

            {step === "thanks" && (
              <div className="flex flex-col items-center gap-4">
                {status === "CONFIRMED" && (
                  <p className={cn("font-medium", confirmedFont)} style={confirmedTextStyle}>
                    {confirmedMessage}
                  </p>
                )}
                {status === "DECLINED" && (
                  <p className="font-medium opacity-80" style={mutedStyle}>
                    {declineMessage}
                  </p>
                )}
                <Button
                  style={accentStyle}
                  onClick={() => setStep(askGiftIntent ? "ask-gift" : "gifts")}
                >
                  Continuar
                </Button>
              </div>
            )}

            {step === "ask-gift" && (
              <div className="flex flex-col items-center gap-4">
                <p className="font-medium">Quer presentear o casal?</p>
                <div className="flex gap-3">
                  <Button style={accentStyle} onClick={() => setStep("gifts")}>
                    Sim, quero ver os presentes
                  </Button>
                  <Button variant="outline" onClick={() => setStep("done")}>
                    Agora não
                  </Button>
                </div>
              </div>
            )}

            {step === "done" && (
              <p className="font-medium opacity-80" style={mutedStyle}>
                Combinado! Até breve 💛
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
