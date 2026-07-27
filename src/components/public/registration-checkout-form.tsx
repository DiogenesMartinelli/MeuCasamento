"use client";

import { useActionState } from "react";
import { startRegistrationCheckout, type StartRegistrationState } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: StartRegistrationState = {};

export function RegistrationCheckoutForm() {
  const [state, formAction, isPending] = useActionState(startRegistrationCheckout, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Seu e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} size="lg">
        {isPending ? "Redirecionando..." : "Pagar com cartão — R$ 49,90"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Pagamento único, sem mensalidade. Você será redirecionado ao Mercado Pago para concluir
        com segurança.
      </p>
    </form>
  );
}
