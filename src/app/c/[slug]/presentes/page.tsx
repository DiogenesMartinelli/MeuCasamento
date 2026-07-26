import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAccountBySlug } from "@/lib/queries/account";
import { getGiftsForAccount } from "@/lib/queries/gifts";
import { getSiteTemplate } from "@/lib/site-templates";
import { GiftsList } from "@/components/public/gifts-list";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const account = await getAccountBySlug(slug);
  return { title: `Presentes · ${account?.siteSettings?.coupleName || "Casamento"}` };
}

export default async function GiftsPage({ params }: PageProps) {
  const { slug } = await params;
  const account = await getAccountBySlug(slug);
  if (!account) notFound();

  const gifts = await getGiftsForAccount(account.id);
  const template = getSiteTemplate(account.siteSettings?.template);

  return (
    <main className={`px-6 py-16 ${template.sectionBg}`}>
      <div className="mx-auto max-w-6xl">
        <h1 className={`text-center text-3xl font-semibold ${template.headingFont}`}>
          Lista de Presentes
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Escolha um presente físico ou contribua com uma cota para{" "}
          {account.siteSettings?.coupleName || "os noivos"}.
        </p>
        <div className="mt-10">
          <GiftsList
            gifts={gifts}
            events={account.events}
            accentColor={account.siteSettings?.accentColor}
            shape={account.siteSettings?.giftCardShape}
          />
        </div>
      </div>
    </main>
  );
}
