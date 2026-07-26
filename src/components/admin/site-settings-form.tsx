"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateSiteSettings, type SiteSettingsFormState } from "@/lib/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePicker } from "@/components/admin/template-picker";
import type { SiteSettings } from "@/generated/prisma/client";

const initialState: SiteSettingsFormState = {};

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coupleName">Nome do casal</Label>
        <Input id="coupleName" name="coupleName" defaultValue={settings?.coupleName ?? ""} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
        <Textarea
          id="welcomeMessage"
          name="welcomeMessage"
          rows={3}
          defaultValue={settings?.welcomeMessage ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Estilo do site</Label>
        <TemplatePicker defaultValue={settings?.template ?? "CLASSIC"} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="declineMessage">Mensagem para quem não puder ir</Label>
        <Textarea
          id="declineMessage"
          name="declineMessage"
          rows={2}
          defaultValue={
            settings?.declineMessage ??
            "Que pena! Sentiremos sua falta, mas agradecemos por avisar. 💛"
          }
        />
        <p className="text-xs text-muted-foreground">
          Aparece para o convidado quando ele confirma que não poderá comparecer.
        </p>
      </div>

      <ImageField
        name="backgroundImage"
        label="Imagem de fundo (hero)"
        currentUrl={settings?.backgroundImageUrl}
      />
      <ImageField
        name="bannerImage"
        label="Banner (seção de eventos)"
        currentUrl={settings?.bannerImageUrl}
      />
      <ImageField
        name="profileImage"
        label="Foto de perfil do casal"
        currentUrl={settings?.profileImageUrl}
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Configurações salvas!</p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}

function ImageField({
  name,
  label,
  currentUrl,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {currentUrl && (
        <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-md border bg-muted sm:h-40">
          <Image src={currentUrl} alt={label} fill className="object-cover" />
        </div>
      )}
      <Input id={name} name={name} type="file" accept="image/*" />
    </div>
  );
}
