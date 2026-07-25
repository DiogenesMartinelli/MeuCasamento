import { prisma } from "@/lib/prisma";

export async function getGiftsForAccount(accountId: string, eventId?: string) {
  return prisma.gift.findMany({
    where: { accountId, ...(eventId ? { eventId } : {}) },
    include: { event: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}
