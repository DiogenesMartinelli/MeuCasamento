"use client";

import { useActionState, useEffect, useRef } from "react";
import { createGuestMessage, type GuestMessageFormState } from "@/lib/actions/guest-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: GuestMessageFormState = {};

export function GuestMessageForm({
  accountId,
  slug,
  defaultAuthorName,
}: {
  accountId: string;
  slug: string;
  defaultAuthorName?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = createGuestMessage.bind(null, accountId, slug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <Input name="authorName" placeholder="Seu nome" defaultValue={defaultAuthorName} required maxLength={80} />
      <Textarea
        name="content"
        placeholder="Deixe seu recado para os noivos..."
        required
        maxLength={500}
        rows={3}
      />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Recado enviado! Obrigado 💌</p>
      )}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Enviando..." : "Enviar recado"}
      </Button>
    </form>
  );
}
