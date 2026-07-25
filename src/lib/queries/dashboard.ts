import { prisma } from "@/lib/prisma";

export async function getDashboardStats(accountId: string) {
  const [
    guestsTotal,
    guestsConfirmed,
    guestsDeclined,
    giftsTotal,
    giftsPurchased,
    messagesTotal,
    messagesHidden,
  ] = await Promise.all([
    prisma.guest.count({ where: { accountId } }),
    prisma.guest.count({ where: { accountId, status: "CONFIRMED" } }),
    prisma.guest.count({ where: { accountId, status: "DECLINED" } }),
    prisma.gift.count({ where: { accountId } }),
    prisma.gift.count({ where: { accountId, status: "PURCHASED" } }),
    prisma.guestMessage.count({ where: { accountId } }),
    prisma.guestMessage.count({ where: { accountId, isVisible: false } }),
  ]);

  return {
    guestsTotal,
    guestsConfirmed,
    guestsDeclined,
    giftsTotal,
    giftsPurchased,
    messagesTotal,
    messagesHidden,
  };
}
