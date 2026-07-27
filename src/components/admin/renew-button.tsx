"use client";

import { useState, useTransition } from "react";
import { startRenewalCheckout } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";

export function RenewButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startRenewalCheckout();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? "Redirecionando..." : "Renovar por +12 meses — R$ 49,90"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
