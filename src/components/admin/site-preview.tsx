"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getAccentButtonStyle,
  getCardStyle,
  getHeroFallbackStyle,
  getMutedTextStyle,
  getSectionStyle,
  getTextStyle,
  GIFT_CARD_SHAPE_CLASS,
} from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";
import { getSiteTemplate } from "@/lib/site-templates";
import type { SiteTemplateConfig } from "@/lib/site-templates";
import type { GiftCardShape, SiteTemplate } from "@/generated/prisma/client";

const PLACEHOLDER_GIFTS = [
  { id: "1", title: "Jogo de Panelas" },
  { id: "2", title: "Cota Lua de Mel" },
];

export type SitePreviewProps = {
  template: SiteTemplate;
  colors: SiteColors;
  coupleName: string;
  welcomeMessage: string;
  declineMessage: string;
  giftCardShape: GiftCardShape;
  askGiftIntent: boolean;
  backgroundImageUrl?: string | null;
  profileImageUrl?: string | null;
};

export function SitePreview(props: SitePreviewProps) {
  const [tab, setTab] = useState<"site" | "rsvp">("site");
  const template = getSiteTemplate(props.template);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-lg border p-1">
        <button
          type="button"
          onClick={() => setTab("site")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "site" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Site
        </button>
        <button
          type="button"
          onClick={() => setTab("rsvp")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "rsvp" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Confirmação (RSVP)
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="flex items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="max-h-[70vh] overflow-y-auto bg-white">
          {tab === "site" ? (
            <SitePreviewHome {...props} templateConfig={template} />
          ) : (
            <RsvpPreview {...props} templateConfig={template} key={String(props.askGiftIntent)} />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Prévia aproximada — o site real pode variar um pouco conforme o tamanho da tela.
      </p>
    </div>
  );
}

function SitePreviewHome({
  templateConfig: template,
  colors,
  coupleName,
  welcomeMessage,
  giftCardShape,
  backgroundImageUrl,
  profileImageUrl,
}: SitePreviewProps & { templateConfig: SiteTemplateConfig }) {
  const shapeClass = GIFT_CARD_SHAPE_CLASS[giftCardShape];

  return (
    <div>
      <div className="relative flex h-56 w-full flex-col items-center justify-center gap-3 overflow-hidden text-center text-white">
        {backgroundImageUrl ? (
          <Image src={backgroundImageUrl} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div
            className="absolute inset-0"
            style={getHeroFallbackStyle(colors.backgroundColor, colors.backgroundGradientTo)}
          />
        )}
        <div className={cn("absolute inset-0", template.heroOverlay)} />
        <div className="relative z-10 flex flex-col items-center gap-2 px-4">
          {profileImageUrl && (
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/80">
              <Image src={profileImageUrl} alt="" fill className="object-cover" unoptimized />
            </div>
          )}
          <h1 className={cn("text-2xl font-semibold", template.headingFont)}>
            {coupleName || "João & Maria"}
          </h1>
          {template.ornament && <p className={cn("text-sm", template.accentText)}>{template.ornament}</p>}
          {welcomeMessage && <p className="text-xs text-white/90">{welcomeMessage}</p>}
        </div>
      </div>

      <div
        className={cn("px-4 py-8 text-center", template.sectionBg)}
        style={getSectionStyle(colors.backgroundColor, colors.textColor, colors.backgroundGradientTo)}
      >
        <h2 className={cn("text-lg font-semibold", template.headingFont)} style={getTextStyle(colors.textColor)}>
          Lista de Presentes
        </h2>
        <p className="mt-1 text-xs opacity-80" style={getMutedTextStyle(colors.mutedTextColor)}>
          Escolha um presente ou contribua com uma cota.
        </p>
        <button
          type="button"
          className={cn("mt-3 bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground", template.buttonRadius)}
          style={getAccentButtonStyle(colors.accentColor)}
        >
          Ver lista de presentes
        </button>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {PLACEHOLDER_GIFTS.map((gift) => (
            <div
              key={gift.id}
              className={cn("overflow-hidden rounded-lg border text-left", template.cardClass)}
              style={getCardStyle(colors.cardBackgroundColor, colors.borderColor, colors.cardBackgroundGradientTo)}
            >
              <div className={cn("h-16 w-full bg-muted", shapeClass.image)} />
              <div className="p-2">
                <p className="text-xs font-medium">{gift.title}</p>
                <button
                  type="button"
                  className={cn(
                    "mt-2 w-full bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground",
                    shapeClass.button,
                  )}
                  style={getAccentButtonStyle(colors.accentColor)}
                >
                  Presentear
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type RsvpStep = "respond" | "thanks" | "ask-gift" | "gifts" | "done";

function RsvpPreview({
  templateConfig: template,
  colors,
  coupleName,
  declineMessage,
  giftCardShape,
  askGiftIntent,
}: SitePreviewProps & { templateConfig: SiteTemplateConfig }) {
  const [step, setStep] = useState<RsvpStep>("respond");
  const [status, setStatus] = useState<"CONFIRMED" | "DECLINED" | null>(null);
  const accentStyle = getAccentButtonStyle(colors.accentColor);
  const mutedStyle = getMutedTextStyle(colors.mutedTextColor);
  const shapeClass = GIFT_CARD_SHAPE_CLASS[giftCardShape];

  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 py-10 text-center"
      style={getSectionStyle(colors.backgroundColor, colors.textColor, colors.backgroundGradientTo)}
    >
      {step === "respond" && (
        <>
          <div>
            <h1 className={cn("text-xl font-semibold", template.headingFont)}>Confirme sua presença</h1>
            <p className="mt-1 text-xs opacity-80" style={mutedStyle}>
              {coupleName || "João & Maria"}
            </p>
          </div>
          <div
            className={cn("w-full max-w-[220px] rounded-lg border px-3 py-2 text-xs", template.cardClass)}
            style={getCardStyle(colors.cardBackgroundColor, colors.borderColor, colors.cardBackgroundGradientTo)}
          >
            Convidado Exemplo
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              style={accentStyle}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              onClick={() => {
                setStatus("CONFIRMED");
                setStep("thanks");
              }}
            >
              Confirmar presença
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-xs font-medium"
              onClick={() => {
                setStatus("DECLINED");
                setStep("thanks");
              }}
            >
              Não poderei ir
            </button>
          </div>
        </>
      )}

      {step === "thanks" && (
        <div className="flex flex-col items-center gap-3">
          {status === "CONFIRMED" ? (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Presença confirmada! Vemos vocês lá 🎉
            </p>
          ) : (
            <p className="text-sm font-medium opacity-80" style={mutedStyle}>
              {declineMessage}
            </p>
          )}
          <button
            type="button"
            style={accentStyle}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            onClick={() => setStep(askGiftIntent ? "ask-gift" : "gifts")}
          >
            Continuar
          </button>
        </div>
      )}

      {step === "ask-gift" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium">Quer presentear o casal?</p>
          <div className="flex gap-2">
            <button
              type="button"
              style={accentStyle}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              onClick={() => setStep("gifts")}
            >
              Sim, ver presentes
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-xs font-medium"
              onClick={() => setStep("done")}
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <p className="text-sm font-medium opacity-80" style={mutedStyle}>
          Combinado! Até breve 💛
        </p>
      )}

      {step === "gifts" && (
        <div className="w-full">
          <h2
            className={cn("mb-3 text-center text-lg font-semibold", template.headingFont)}
            style={getTextStyle(colors.textColor)}
          >
            Lista de Presentes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PLACEHOLDER_GIFTS.map((gift) => (
              <div
                key={gift.id}
                className={cn("overflow-hidden rounded-lg border text-left", template.cardClass)}
                style={getCardStyle(colors.cardBackgroundColor, colors.borderColor, colors.cardBackgroundGradientTo)}
              >
                <div className={cn("h-16 w-full bg-muted", shapeClass.image)} />
                <div className="p-2">
                  <p className="text-xs font-medium">{gift.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step !== "respond" && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => {
            setStep("respond");
            setStatus(null);
          }}
        >
          Reiniciar prévia
        </button>
      )}
    </div>
  );
}
