"use client";

import { useActionState } from "react";
import { startRegistrationCheckout, type StartRegistrationState } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsDialog } from "@/components/public/terms-dialog";

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

      <div className="flex items-start gap-2.5">
        <Checkbox id="termsAccepted" name="termsAccepted" required className="mt-0.5 shrink-0" />
        {/* Plain <label>, not the shadcn Label component: that one is flex-based for
            label+icon pairs, which breaks wrapping paragraph text into separate columns. */}
        <label
          htmlFor="termsAccepted"
          className="block text-sm leading-relaxed font-normal text-muted-foreground select-none"
        >
          Li e aceito os{" "}
          <TermsDialog
            trigger={
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Termos de Uso e Contrato de Prestação de Serviço
              </button>
            }
          />
          , incluindo a vigência de 12 meses e a exclusão dos dados ao final do prazo sem
          renovação.
        </label>
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
