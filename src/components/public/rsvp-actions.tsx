"use client";

import { useState, useTransition } from "react";
import { respondRsvp } from "@/lib/actions/rsvp";
import { Button } from "@/components/ui/button";
import type { GuestStatus } from "@/generated/prisma/client";

export function RsvpActions({
  familyToken,
  slug,
  initialStatus,
}: {
  familyToken: string;
  slug: string;
  initialStatus: GuestStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<GuestStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  function handle(next: "CONFIRMED" | "DECLINED") {
    setError(null);
    startTransition(async () => {
      try {
        await respondRsvp(familyToken, slug, next);
        setStatus(next);
      } catch {
        setError("Não foi possível registrar sua resposta. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {status === "CONFIRMED" && (
        <p className="font-medium text-green-600 dark:text-green-400">
          Presença confirmada! Vemos vocês lá 🎉
        </p>
      )}
      {status === "DECLINED" && (
        <p className="font-medium text-muted-foreground">Que pena, sentiremos sua falta 💔</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => handle("CONFIRMED")} disabled={isPending}>
          Confirmar presença
        </Button>
        <Button variant="outline" onClick={() => handle("DECLINED")} disabled={isPending}>
          Não poderei ir
        </Button>
      </div>
    </div>
  );
}
