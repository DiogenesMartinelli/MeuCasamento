import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAccountBySlug } from "@/lib/queries/account";
import { getVisibleMessages } from "@/lib/queries/messages";
import { HeroSection } from "@/components/public/hero-section";
import { EventsBanner } from "@/components/public/events-banner";
import { GuestMessageForm } from "@/components/public/guest-message-form";
import { GuestMessageWall } from "@/components/public/guest-message-wall";
import { Button } from "@/components/ui/button";

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

  return (
    <main>
      <HeroSection
        coupleName={settings?.coupleName || "Nosso Casamento"}
        welcomeMessage={settings?.welcomeMessage || ""}
        backgroundImageUrl={settings?.backgroundImageUrl}
        profileImageUrl={settings?.profileImageUrl}
      />

      <EventsBanner events={account.events} bannerImageUrl={settings?.bannerImageUrl} />

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-serif text-3xl font-semibold">Lista de Presentes</h2>
        <p className="mt-3 text-muted-foreground">
          Sua presença já é o maior presente, mas se quiser nos ajudar a começar essa nova fase...
        </p>
        <Button
          className="mt-6"
          render={<Link href={`/c/${slug}/presentes`}>Ver lista de presentes</Link>}
        />
      </section>

      <section id="mural" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-serif text-3xl font-semibold">Mural de Recados</h2>
        <div className="mx-auto mt-8 max-w-xl">
          <GuestMessageForm accountId={account.id} slug={slug} />
        </div>
        <div className="mt-12">
          <GuestMessageWall messages={messages} />
        </div>
      </section>
    </main>
  );
}
