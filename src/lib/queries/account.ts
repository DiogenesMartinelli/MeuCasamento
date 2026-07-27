import { prisma } from "@/lib/prisma";

export async function getAccountBySlug(slug: string) {
  return prisma.account.findUnique({
    where: { slug },
    include: { siteSettings: true, rsvpTheme: true, events: { orderBy: { date: "asc" } } },
  });
}
