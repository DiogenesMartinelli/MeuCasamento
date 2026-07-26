import { notFound } from "next/navigation";
import { getAccountBySlug } from "@/lib/queries/account";
import { getGuestFamily } from "@/lib/queries/guests";
import { getGiftsForAccount } from "@/lib/queries/gifts";
import { getSiteTemplate } from "@/lib/site-templates";
import { RsvpFlow } from "@/components/public/rsvp-flow";
import { getSectionStyle } from "@/lib/accent-color";
import type { SiteColors } from "@/lib/accent-color";

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
  const colors: SiteColors = {
    accentColor: account.siteSettings?.accentColor,
    backgroundColor: account.siteSettings?.backgroundColor,
    textColor: account.siteSettings?.textColor,
    mutedTextColor: account.siteSettings?.mutedTextColor,
    cardBackgroundColor: account.siteSettings?.cardBackgroundColor,
    borderColor: account.siteSettings?.borderColor,
  };

  return (
    <main
      className={`mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-16 ${template.sectionBg}`}
      style={getSectionStyle(account.siteSettings?.backgroundColor, account.siteSettings?.textColor)}
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
        giftCardShape={account.siteSettings?.giftCardShape}
        colors={colors}
        askGiftIntent={account.siteSettings?.askGiftIntent ?? true}
      />
    </main>
  );
}
