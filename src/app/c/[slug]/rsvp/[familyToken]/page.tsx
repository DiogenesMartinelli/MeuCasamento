import { notFound } from "next/navigation";
import { getAccountBySlug } from "@/lib/queries/account";
import { getGuestFamily } from "@/lib/queries/guests";
import { getSiteTemplate } from "@/lib/site-templates";
import { RsvpActions } from "@/components/public/rsvp-actions";

type PageProps = { params: Promise<{ slug: string; familyToken: string }> };

export default async function RsvpPage({ params }: PageProps) {
  const { slug, familyToken } = await params;
  const account = await getAccountBySlug(slug);
  if (!account) notFound();

  const guests = await getGuestFamily(familyToken);
  const familyGuests = guests.filter((guest) => guest.event.accountId === account.id);
  if (familyGuests.length === 0) notFound();

  const template = getSiteTemplate(account.siteSettings?.template);

  return (
    <main
      className={`mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 px-6 py-16 text-center ${template.sectionBg}`}
    >
      <div>
        <h1 className={`text-3xl font-semibold ${template.headingFont}`}>Confirme sua presença</h1>
        <p className="mt-2 text-muted-foreground">{account.siteSettings?.coupleName}</p>
      </div>

      <ul className={`w-full divide-y rounded-lg border ${template.cardClass}`}>
        {familyGuests.map((guest) => (
          <li key={guest.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{guest.name}</span>
            <span className="text-xs text-muted-foreground">{guest.event.name}</span>
          </li>
        ))}
      </ul>

      <RsvpActions
        familyToken={familyToken}
        slug={slug}
        initialStatus={familyGuests[0].status}
      />
    </main>
  );
}
