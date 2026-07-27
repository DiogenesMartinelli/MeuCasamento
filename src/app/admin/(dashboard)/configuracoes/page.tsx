import { getCurrentAccount } from "@/lib/current-account";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { RsvpThemeForm } from "@/components/admin/rsvp-theme-form";

export default async function ConfiguracoesPage() {
  const account = await getCurrentAccount();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Configurações do site</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Personalize o nome, mensagem e imagens do site do seu casamento.
      </p>
      <div className="mt-8">
        <SiteSettingsForm settings={account?.siteSettings ?? null} />
      </div>

      <div className="mt-16 border-t pt-8">
        <h2 className="font-serif text-xl font-semibold">Estilo do RSVP</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dê à tela de confirmação de presença um visual e uma ambientação próprios.
        </p>
        <div className="mt-8">
          <RsvpThemeForm rsvpTheme={account?.rsvpTheme ?? null} />
        </div>
      </div>
    </div>
  );
}
