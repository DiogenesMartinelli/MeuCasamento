import { notFound } from "next/navigation";
import { getAccountBySlug } from "@/lib/queries/account";
import { getGuestFamily } from "@/lib/queries/guests";
import { getGiftsForAccount } from "@/lib/queries/gifts";
import { getSiteTemplate } from "@/lib/site-templates";
import { RsvpFlow } from "@/components/public/rsvp-flow";
import { resolveRsvpColors } from "@/lib/rsvp-theme";
import type { SiteColors } from "@/lib/accent-color";

type PageProps = { params: Promise<{ slug: string; familyToken: string }> };

export default async function RsvpPage({ params }: PageProps) {
  const { slug, familyToken } = await params;
  // getGuestFamily only depends on familyToken, not on the account lookup, so it
  // doesn't need to wait behind it.
  const [account, guests] = await Promise.all([getAccountBySlug(slug), getGuestFamily(familyToken)]);
  if (!account) notFound();

  const familyGuests = guests.filter((guest) => guest.event.accountId === account.id);
  if (familyGuests.length === 0) notFound();

  const gifts = await getGiftsForAccount(account.id);
  const template = getSiteTemplate(account.siteSettings?.template);
  const siteColors: SiteColors = {
    accentColor: account.siteSettings?.accentColor,
    backgroundColor: account.siteSettings?.backgroundColor,
    backgroundGradientTo: account.siteSettings?.backgroundGradientTo,
    textColor: account.siteSettings?.textColor,
    mutedTextColor: account.siteSettings?.mutedTextColor,
    cardBackgroundColor: account.siteSettings?.cardBackgroundColor,
    cardBackgroundGradientTo: account.siteSettings?.cardBackgroundGradientTo,
    borderColor: account.siteSettings?.borderColor,
  };
  const colors = resolveRsvpColors(siteColors, account.rsvpTheme);

  return (
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
      sectionBgClass={template.sectionBg}
      cardClass={template.cardClass}
      giftCardShape={account.siteSettings?.giftCardShape}
      colors={colors}
      askGiftIntent={account.siteSettings?.askGiftIntent ?? true}
      rsvpTheme={account.rsvpTheme}
    />
  );
}
