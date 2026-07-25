"use client";

import { useActionState } from "react";
import { createAccount, type CreateAccountFormState } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateAccountFormState = {};

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(createAccount, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coupleName">Nome do casal</Label>
        <Input id="coupleName" name="coupleName" placeholder="João & Maria" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Endereço do site</Label>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">/c/</span>
          <Input id="slug" name="slug" placeholder="joao-e-maria" />
        </div>
        <p className="text-xs text-muted-foreground">Deixe em branco para gerar a partir do nome do casal.</p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando..." : "Criar meu site"}
      </Button>
    </form>
  );
}
