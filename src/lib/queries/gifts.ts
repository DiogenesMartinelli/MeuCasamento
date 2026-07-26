import { prisma } from "@/lib/prisma";

export async function getGiftsForAccount(accountId: string, eventId?: string) {
  const gifts = await prisma.gift.findMany({
    where: { accountId, ...(eventId ? { eventId } : {}) },
    include: { event: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  // Prisma's Decimal instances aren't plain objects, so they can't cross the
  // Server Component -> Client Component boundary (GiftsList/GiftCard are client).
  return gifts.map((gift) => ({
    ...gift,
    price: gift.price === null ? null : Number(gift.price),
  }));
}

export type SerializedGift = Awaited<ReturnType<typeof getGiftsForAccount>>[number];
