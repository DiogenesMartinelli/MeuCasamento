"use client";

import { useState, useTransition } from "react";
import { respondRsvp } from "@/lib/actions/rsvp";
import { Button } from "@/components/ui/button";
import { GiftsList } from "@/components/public/gifts-list";
import { getAccentButtonStyle } from "@/lib/accent-color";
import type { SerializedGift } from "@/lib/queries/gifts";
import type { Event, GiftCardShape, GuestStatus } from "@/generated/prisma/client";

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
  cardClass,
  accentColor,
  giftCardShape,
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
  cardClass: string;
  accentColor?: string | null;
  giftCardShape?: GiftCardShape;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<GuestStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(initialStatus === "PENDING" ? "respond" : "thanks");
  const accentStyle = getAccentButtonStyle(accentColor);

  function handle(next: "CONFIRMED" | "DECLINED") {
    setError(null);
    startTransition(async () => {
      try {
        await respondRsvp(familyToken, slug, next);
        setStatus(next);
        setStep("thanks");
      } catch {
        setError("Não foi possível registrar sua resposta. Tente novamente.");
      }
    });
  }

  if (step === "gifts") {
    return (
      <div className="w-full max-w-6xl">
        <h1 className={`mb-6 text-center text-3xl font-semibold ${headingFont}`}>
          Lista de Presentes
        </h1>
        <GiftsList gifts={gifts} events={events} accentColor={accentColor} shape={giftCardShape} />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
      {step === "respond" && (
        <>
          <div>
            <h1 className={`text-3xl font-semibold ${headingFont}`}>Confirme sua presença</h1>
            <p className="mt-2 text-muted-foreground">{coupleName}</p>
          </div>

          <ul className={`w-full divide-y rounded-lg border ${cardClass}`}>
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
            <p className="font-medium text-green-600 dark:text-green-400">
              Presença confirmada! Vemos vocês lá 🎉
            </p>
          )}
          {status === "DECLINED" && (
            <p className="font-medium text-muted-foreground">{declineMessage}</p>
          )}
          <Button style={accentStyle} onClick={() => setStep("ask-gift")}>
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
        <p className="font-medium text-muted-foreground">Combinado! Até breve 💛</p>
      )}
    </div>
  );
}
