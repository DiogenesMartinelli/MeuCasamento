"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { updateSiteSettings, type SiteSettingsFormState } from "@/lib/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePicker } from "@/components/admin/template-picker";
import { ShapePicker } from "@/components/admin/shape-picker";
import { ColorPickerField } from "@/components/admin/color-picker-field";
import { SitePreview } from "@/components/admin/site-preview";
import type { SiteColors } from "@/lib/accent-color";
import type { GiftCardShape, SiteSettings, SiteTemplate } from "@/generated/prisma/client";

const initialState: SiteSettingsFormState = {};
const DEFAULT_DECLINE_MESSAGE = "Que pena! Sentiremos sua falta, mas agradecemos por avisar. 💛";

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);
  const [template, setTemplate] = useState<SiteTemplate>(settings?.template ?? "CLASSIC");
  const [coupleName, setCoupleName] = useState(settings?.coupleName ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(settings?.welcomeMessage ?? "");
  const [declineMessage, setDeclineMessage] = useState(settings?.declineMessage ?? DEFAULT_DECLINE_MESSAGE);
  const [giftCardShape, setGiftCardShape] = useState<GiftCardShape>(settings?.giftCardShape ?? "ROUNDED");
  const [askGiftIntent, setAskGiftIntent] = useState(settings?.askGiftIntent ?? true);
  const [colors, setColors] = useState<SiteColors>({
    accentColor: settings?.accentColor,
    backgroundColor: settings?.backgroundColor,
    textColor: settings?.textColor,
    mutedTextColor: settings?.mutedTextColor,
    cardBackgroundColor: settings?.cardBackgroundColor,
    borderColor: settings?.borderColor,
  });
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(settings?.backgroundImageUrl ?? null);
  const [profileImageUrl, setProfileImageUrl] = useState(settings?.profileImageUrl ?? null);
  const isCustom = template === "CUSTOM";

  function updateColor(key: keyof SiteColors) {
    return (value: string) => setColors((prev) => ({ ...prev, [key]: value || null }));
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form action={formAction} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coupleName">Nome do casal</Label>
          <Input
            id="coupleName"
            name="coupleName"
            value={coupleName}
            onChange={(e) => setCoupleName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
          <Textarea
            id="welcomeMessage"
            name="welcomeMessage"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
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
              onChange={updateColor("accentColor")}
            />
            <p className="text-xs text-muted-foreground">Cor dos botões principais.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Cor de fundo</Label>
            <ColorPickerField
              name="backgroundColor"
              ariaLabel="Escolher cor de fundo"
              defaultValue={settings?.backgroundColor}
              onChange={updateColor("backgroundColor")}
            />
            <p className="text-xs text-muted-foreground">Fundo das seções do site.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Cor do texto</Label>
            <ColorPickerField
              name="textColor"
              ariaLabel="Escolher cor do texto"
              defaultValue={settings?.textColor}
              onChange={updateColor("textColor")}
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
                onChange={updateColor("mutedTextColor")}
              />
              <p className="text-xs text-muted-foreground">Descrições, legendas e datas.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cor dos cards</Label>
              <ColorPickerField
                name="cardBackgroundColor"
                ariaLabel="Escolher cor de fundo dos cards"
                defaultValue={settings?.cardBackgroundColor}
                onChange={updateColor("cardBackgroundColor")}
              />
              <p className="text-xs text-muted-foreground">Fundo dos cards de presente e recados.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cor das bordas</Label>
              <ColorPickerField
                name="borderColor"
                ariaLabel="Escolher cor das bordas"
                defaultValue={settings?.borderColor}
                onChange={updateColor("borderColor")}
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
          <ShapePicker defaultValue={settings?.giftCardShape ?? "ROUNDED"} onChange={setGiftCardShape} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="declineMessage">Mensagem para quem não puder ir</Label>
          <Textarea
            id="declineMessage"
            name="declineMessage"
            rows={2}
            value={declineMessage}
            onChange={(e) => setDeclineMessage(e.target.value)}
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
          currentUrl={backgroundImageUrl}
          onPreview={setBackgroundImageUrl}
        />
        <ImageField
          name="bannerImage"
          label="Banner (seção de eventos)"
          currentUrl={settings?.bannerImageUrl}
        />
        <ImageField
          name="profileImage"
          label="Foto de perfil do casal"
          currentUrl={profileImageUrl}
          onPreview={setProfileImageUrl}
        />

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-green-600 dark:text-green-400">Configurações salvas!</p>
        )}

        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>

      <div className="hidden lg:block">
        <div className="sticky top-6">
          <SitePreview
            template={template}
            colors={colors}
            coupleName={coupleName}
            welcomeMessage={welcomeMessage}
            declineMessage={declineMessage}
            giftCardShape={giftCardShape}
            askGiftIntent={askGiftIntent}
            backgroundImageUrl={backgroundImageUrl}
            profileImageUrl={profileImageUrl}
          />
        </div>
      </div>
    </div>
  );
}

function ImageField({
  name,
  label,
  currentUrl,
  onPreview,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  onPreview?: (url: string) => void;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onPreview) onPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {currentUrl && (
        <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-md border bg-muted sm:h-40">
          <Image src={currentUrl} alt={label} fill className="object-cover" unoptimized={currentUrl.startsWith("blob:")} />
        </div>
      )}
      <Input id={name} name={name} type="file" accept="image/*" onChange={handleChange} />
    </div>
  );
}
