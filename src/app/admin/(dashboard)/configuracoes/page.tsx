import { getCurrentAccount } from "@/lib/current-account";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

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
    </div>
  );
}
