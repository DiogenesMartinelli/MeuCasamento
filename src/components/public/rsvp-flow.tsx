"use client";

import { useState, useTransition } from "react";
import { respondRsvp } from "@/lib/actions/rsvp";
import { Button } from "@/components/ui/button";
import { GiftsList } from "@/components/public/gifts-list";
import { GuestMessageForm } from "@/components/public/guest-message-form";
import { getAccentButtonStyle, getCardStyle, getTextStyle, getMutedTextStyle, getSectionStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import { getAnimatedBackgroundStyle, getRsvpFontClass } from "@/lib/rsvp-theme";
import { AnimatedBackground, ConfirmBurst, LightingOverlay, Sparkles, StringLights } from "@/components/public/rsvp-decorations";
import { cn } from "@/lib/utils";
import type { SerializedGift } from "@/lib/queries/gifts";
import type { Event, GiftCardShape, GuestStatus, RsvpTheme } from "@/generated/prisma/client";

type Step = "respond" | "hub";

type FamilyGuest = { id: string; name: string; event: { name: string } };

export function RsvpFlow({
  familyToken,
  slug,
  accountId,
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
  rsvpTheme,
  askGiftIntent = true,
}: {
  familyToken: string;
  slug: string;
  accountId: string;
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
  rsvpTheme?: RsvpTheme | null;
  askGiftIntent?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<GuestStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  // null = not answered yet (only meaningful when askGiftIntent is on).
  const [wantsGifts, setWantsGifts] = useState<boolean | null>(null);
  // Once a family has answered, their link always lands on "hub" - a permanent page
  // they can revisit, not a one-time "thanks" screen that dead-ends every time.
  const [step, setStep] = useState<Step>(initialStatus === "PENDING" ? "respond" : "hub");
  const [justConfirmed, setJustConfirmed] = useState(false);
  const accentStyle = getAccentButtonStyle(colors?.accentColor);
  const mutedStyle = getMutedTextStyle(colors?.mutedTextColor);

  const useCustomBg = !!rsvpTheme?.useCustomStyle;
  const backgroundType = useCustomBg ? rsvpTheme?.backgroundType ?? "INHERIT" : "INHERIT";
  const usesFlatBackground = backgroundType === "INHERIT" || backgroundType === "COLOR";
  const usesMedia = backgroundType === "IMAGE" || backgroundType === "VIDEO";
  const isAnimated = backgroundType === "ANIMATED";
  const needsLightText = usesMedia && !colors?.textColor;

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

  // "Vitrificação" wraps each block of the hub as its own glass frame - the correct
  // read of "glass card" is a frame per block, not one giant panel or a bunch of
  // plain unstyled content floating on the background.
  const frameStyle = useCustomBg
    ? getCardStyle(colors?.cardBackgroundColor, colors?.borderColor, colors?.cardBackgroundGradientTo, colors?.glassCards)
    : undefined;
  const hasFrame = !!frameStyle;
  const frameClass = cn("animate-rsvp-step-in", hasFrame && "rounded-2xl p-8 sm:p-10");
  const listClass = cn("w-full divide-y rounded-lg", hasFrame ? "divide-white/15" : cn("border", cardClass));

  function handle(next: "CONFIRMED" | "DECLINED") {
    setError(null);
    startTransition(async () => {
      try {
        await respondRsvp(familyToken, slug, next);
        setStatus(next);
        setStep("hub");
        setJustConfirmed(next === "CONFIRMED");
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

      <div className={cn("relative z-10 w-full", needsLightText && "text-white", step === "hub" ? "max-w-4xl" : "max-w-lg")}>
        {step === "respond" && (
          <div key="respond" className={cn("flex flex-col items-center gap-8 text-center", frameClass)} style={frameStyle}>
            <div>
              <h1 className={cn("text-3xl font-semibold", resolvedHeadingFont)}>Confirme sua presença</h1>
              <p className="mt-2 opacity-80" style={mutedStyle}>
                {coupleName}
              </p>
            </div>

            <ul className={listClass}>
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
          </div>
        )}

        {step === "hub" && (
          <div key="hub" className="flex flex-col gap-8">
            <div className={cn("flex flex-col items-center gap-4 text-center", frameClass)} style={frameStyle}>
              {status === "CONFIRMED" ? (
                <p className={cn("font-medium", confirmedFont)} style={confirmedTextStyle}>
                  {confirmedMessage}
                </p>
              ) : (
                <p className="font-medium opacity-80" style={mutedStyle}>
                  {declineMessage}
                </p>
              )}

              <ul className={cn(listClass, "max-w-sm text-left")}>
                {familyGuests.map((guest) => (
                  <li key={guest.id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-medium">{guest.name}</span>
                    <span className="text-xs text-muted-foreground">{guest.event.name}</span>
                  </li>
                ))}
              </ul>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {status === "CONFIRMED" ? (
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-xs opacity-70" style={mutedStyle}>
                    Não vai poder vir mais?
                  </p>
                  <Button variant="outline" size="sm" onClick={() => handle("DECLINED")} disabled={isPending}>
                    Avisar que não vou
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-xs opacity-70" style={mutedStyle}>
                    Mudou de ideia?
                  </p>
                  <Button style={accentStyle} size="sm" onClick={() => handle("CONFIRMED")} disabled={isPending}>
                    Confirmar presença
                  </Button>
                </div>
              )}
            </div>

            {gifts.length > 0 && (
              <div className={frameClass} style={frameStyle}>
                {askGiftIntent && wantsGifts === null && (
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-medium" style={getTextStyle(colors?.textColor)}>
                      Quer presentear o casal?
                    </p>
                    <div className="flex gap-3">
                      <Button style={accentStyle} onClick={() => setWantsGifts(true)}>
                        Sim, quero ver os presentes
                      </Button>
                      <Button variant="outline" onClick={() => setWantsGifts(false)}>
                        Agora não
                      </Button>
                    </div>
                  </div>
                )}

                {askGiftIntent && wantsGifts === false && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium opacity-80" style={mutedStyle}>
                      Sem problemas!
                    </p>
                    <button
                      type="button"
                      className="text-xs underline opacity-70"
                      style={mutedStyle}
                      onClick={() => setWantsGifts(true)}
                    >
                      Ver lista de presentes
                    </button>
                  </div>
                )}

                {(!askGiftIntent || wantsGifts === true) && (
                  <>
                    <h2
                      className={cn("mb-6 text-center text-2xl font-semibold", resolvedHeadingFont)}
                      style={getTextStyle(colors?.textColor)}
                    >
                      Lista de Presentes
                    </h2>
                    <GiftsList gifts={gifts} events={events} colors={colors} shape={giftCardShape} />
                  </>
                )}
              </div>
            )}

            <div className={frameClass} style={frameStyle}>
              <h2
                className={cn("mb-4 text-center text-2xl font-semibold", resolvedHeadingFont)}
                style={getTextStyle(colors?.textColor)}
              >
                Deixe um recado para os noivos
              </h2>
              <div className="mx-auto max-w-lg">
                <GuestMessageForm accountId={accountId} slug={slug} defaultAuthorName={familyGuests[0]?.name} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
