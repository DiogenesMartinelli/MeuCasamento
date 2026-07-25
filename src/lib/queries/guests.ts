import { prisma } from "@/lib/prisma";

/** All guests sharing a family token, i.e. the whole family unit behind one RSVP link. */
export async function getGuestFamily(familyToken: string) {
  const guests = await prisma.guest.findMany({
    where: { familyToken },
    include: { event: true },
    orderBy: { name: "asc" },
  });
  return guests;
}
