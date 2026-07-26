"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { updateSiteSettings, type SiteSettingsFormState } from "@/lib/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePicker } from "@/components/admin/template-picker";
import { ShapePicker } from "@/components/admin/shape-picker";
import { ColorPickerField } from "@/components/admin/color-picker-field";
import type { SiteSettings, SiteTemplate } from "@/generated/prisma/client";

const initialState: SiteSettingsFormState = {};

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);
  const [template, setTemplate] = useState<SiteTemplate>(settings?.template ?? "CLASSIC");
  const [askGiftIntent, setAskGiftIntent] = useState(settings?.askGiftIntent ?? true);
  const isCustom = template === "CUSTOM";

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
        <TemplatePicker defaultValue={settings?.template ?? "CLASSIC"} onChange={setTemplate} />
        {isCustom && (
          <p className="text-xs text-muted-foreground">
            Estilo &quot;Outro&quot; selecionado: você pode definir todas as cores do site abaixo.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Cor de destaque</Label>
          <ColorPickerField
            name="accentColor"
            ariaLabel="Escolher cor de destaque"
            defaultValue={settings?.accentColor}
          />
          <p className="text-xs text-muted-foreground">Cor dos botões principais.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cor de fundo</Label>
          <ColorPickerField
            name="backgroundColor"
            ariaLabel="Escolher cor de fundo"
            defaultValue={settings?.backgroundColor}
          />
          <p className="text-xs text-muted-foreground">Fundo das seções do site.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cor do texto</Label>
          <ColorPickerField
            name="textColor"
            ariaLabel="Escolher cor do texto"
            defaultValue={settings?.textColor}
          />
          <p className="text-xs text-muted-foreground">Cor dos títulos e textos.</p>
        </div>
      </div>

      {isCustom && (
        <div className="grid gap-4 rounded-lg border border-dashed p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label>Cor do texto secundário</Label>
            <ColorPickerField
              name="mutedTextColor"
              ariaLabel="Escolher cor do texto secundário"
              defaultValue={settings?.mutedTextColor}
            />
            <p className="text-xs text-muted-foreground">Descrições, legendas e datas.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Cor dos cards</Label>
            <ColorPickerField
              name="cardBackgroundColor"
              ariaLabel="Escolher cor de fundo dos cards"
              defaultValue={settings?.cardBackgroundColor}
            />
            <p className="text-xs text-muted-foreground">Fundo dos cards de presente e recados.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Cor das bordas</Label>
            <ColorPickerField
              name="borderColor"
              ariaLabel="Escolher cor das bordas"
              defaultValue={settings?.borderColor}
            />
            <p className="text-xs text-muted-foreground">Bordas dos cards e listas.</p>
          </div>
        </div>
      )}
      <p className="-mt-4 text-xs text-muted-foreground">
        Todas opcionais: o que não for definido usa a cor padrão do estilo escolhido acima.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label>Formato dos cards de presente</Label>
        <ShapePicker defaultValue={settings?.giftCardShape ?? "ROUNDED"} />
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

      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="askGiftIntent"
            checked={askGiftIntent}
            onChange={(e) => setAskGiftIntent(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Perguntar se o convidado quer presentear antes de mostrar a lista
        </label>
        <p className="text-xs text-muted-foreground">
          {askGiftIntent
            ? "No RSVP, depois da confirmação o convidado vê a pergunta \"quer presentear o casal?\" antes da lista de presentes."
            : "No RSVP, depois da confirmação o convidado já vê a lista de presentes direto, sem pergunta intermediária."}
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
