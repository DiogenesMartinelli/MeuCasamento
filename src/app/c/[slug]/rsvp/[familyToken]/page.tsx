import { notFound } from "next/navigation";
import { getAccountBySlug } from "@/lib/queries/account";
import { getGuestFamily } from "@/lib/queries/guests";
import { getGiftsForAccount } from "@/lib/queries/gifts";
import { getSiteTemplate } from "@/lib/site-templates";
import { RsvpFlow } from "@/components/public/rsvp-flow";

type PageProps = { params: Promise<{ slug: string; familyToken: string }> };

export default async function RsvpPage({ params }: PageProps) {
  const { slug, familyToken } = await params;
  const account = await getAccountBySlug(slug);
  if (!account) notFound();

  const guests = await getGuestFamily(familyToken);
  const familyGuests = guests.filter((guest) => guest.event.accountId === account.id);
  if (familyGuests.length === 0) notFound();

  const gifts = await getGiftsForAccount(account.id);
  const template = getSiteTemplate(account.siteSettings?.template);

  return (
    <main
      className={`mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-16 ${template.sectionBg}`}
    >
      <RsvpFlow
        familyToken={familyToken}
        slug={slug}
        coupleName={account.siteSettings?.coupleName || ""}
        familyGuests={familyGuests}
        initialStatus={familyGuests[0].status}
        declineMessage={
          account.siteSettings?.declineMessage ||
          "Que pena! Sentiremos sua falta, mas agradecemos por avisar. 💛"
        }
        gifts={gifts}
        events={account.events}
        headingFont={template.headingFont}
        cardClass={template.cardClass}
        accentColor={account.siteSettings?.accentColor}
        giftCardShape={account.siteSettings?.giftCardShape}
      />
    </main>
  );
}
