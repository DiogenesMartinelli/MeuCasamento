import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RegistrationCompletion } from "@/components/public/registration-completion";

type PageProps = { searchParams: Promise<{ ref?: string }> };

export default async function RegistrationReturnPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const payment = await prisma.registrationPayment.findUnique({ where: { id: ref } });
  if (!payment) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-16">
      <RegistrationCompletion
        registrationPaymentId={payment.id}
        initialStatus={payment.status}
        initialUsed={!!payment.usedAt}
        email={payment.email}
      />
    </main>
  );
}
