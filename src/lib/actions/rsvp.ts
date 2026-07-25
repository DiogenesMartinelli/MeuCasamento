"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function respondRsvp(familyToken: string, slug: string, status: "CONFIRMED" | "DECLINED") {
  const result = await prisma.guest.updateMany({
    where: { familyToken },
    data: { status, respondedAt: new Date() },
  });

  if (result.count === 0) {
    throw new Error("Família não encontrada");
  }

  revalidatePath(`/c/${slug}/rsvp/${familyToken}`);
}
