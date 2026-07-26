import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAccountBySlug } from "@/lib/queries/account";
import { getVisibleMessages } from "@/lib/queries/messages";
import { getSiteTemplate } from "@/lib/site-templates";
import { HeroSection } from "@/components/public/hero-section";
import { EventsBanner } from "@/components/public/events-banner";
import { GuestMessageForm } from "@/components/public/guest-message-form";
import { GuestMessageWall } from "@/components/public/guest-message-wall";
import { Button } from "@/components/ui/button";
import { getAccentButtonStyle, getSectionStyle, getTextStyle } from "@/lib/accent-color";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const account = await getAccountBySlug(slug);
  return { title: account?.siteSettings?.coupleName || "Nosso Casamento" };
}

export default async function WeddingSitePage({ params }: PageProps) {
  const { slug } = await params;
  const account = await getAccountBySlug(slug);
  if (!account) notFound();

  const [messages] = await Promise.all([getVisibleMessages(account.id)]);
  const settings = account.siteSettings;
  const template = getSiteTemplate(settings?.template);

  return (
    <main>
      <HeroSection
        coupleName={settings?.coupleName || "Nosso Casamento"}
        welcomeMessage={settings?.welcomeMessage || ""}
        backgroundImageUrl={settings?.backgroundImageUrl}
        profileImageUrl={settings?.profileImageUrl}
        template={template}
      />

      <EventsBanner events={account.events} bannerImageUrl={settings?.bannerImageUrl} template={template} />

      <section
        className={`px-6 py-16 text-center ${template.sectionBg}`}
        style={getSectionStyle(settings?.backgroundColor, settings?.textColor)}
      >
        <div className="mx-auto max-w-3xl">
          <h2 className={`text-3xl font-semibold ${template.headingFont}`} style={getTextStyle(settings?.textColor)}>
            Lista de Presentes
          </h2>
          <p className="mt-3 opacity-80">
            Sua presença já é o maior presente, mas se quiser nos ajudar a começar essa nova fase...
          </p>
          <Button
            className={`mt-6 ${template.buttonRadius}`}
            style={getAccentButtonStyle(settings?.accentColor)}
            nativeButton={false}
            render={<Link href={`/c/${slug}/presentes`}>Ver lista de presentes</Link>}
          />
        </div>
      </section>

      <section
        id="mural"
        className="mx-auto max-w-5xl px-6 py-16"
        style={getSectionStyle(undefined, settings?.textColor)}
      >
        <h2 className={`text-center text-3xl font-semibold ${template.headingFont}`} style={getTextStyle(settings?.textColor)}>
          Mural de Recados
        </h2>
        <div className="mx-auto mt-8 max-w-xl">
          <GuestMessageForm accountId={account.id} slug={slug} />
        </div>
        <div className="mt-12">
          <GuestMessageWall messages={messages} template={template} />
        </div>
      </section>
    </main>
  );
}
