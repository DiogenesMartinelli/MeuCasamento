import { prisma } from "@/lib/prisma";

export async function getVisibleMessages(accountId: string) {
  return prisma.guestMessage.findMany({
    where: { accountId, isVisible: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllMessages(accountId: string) {
  return prisma.guestMessage.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
  });
}
