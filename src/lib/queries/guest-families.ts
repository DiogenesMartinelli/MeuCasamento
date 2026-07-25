import { prisma } from "@/lib/prisma";

export async function getGuestFamilies(accountId: string) {
  const guests = await prisma.guest.findMany({
    where: { accountId },
    include: { event: true },
    orderBy: { name: "asc" },
  });

  const families = new Map<string, typeof guests>();
  for (const guest of guests) {
    const list = families.get(guest.familyToken) ?? [];
    list.push(guest);
    families.set(guest.familyToken, list);
  }

  return Array.from(families.entries()).map(([familyToken, members]) => ({
    familyToken,
    members,
    label: members.map((member) => member.name).join(", "),
  }));
}
