"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";

export type EventFormState = { error?: string };

const eventSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do evento").max(120),
  date: z.string().min(1, "Informe a data"),
  description: z.string().trim().max(500).optional(),
  isWedding: z.boolean(),
});

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    description: formData.get("description") || undefined,
    isWedding: formData.get("isWedding") === "on",
  });
}

/** Only one event per account should be marked as the wedding ceremony. */
async function clearOtherWeddingFlags(accountId: string, exceptEventId?: string) {
  await prisma.event.updateMany({
    where: { accountId, isWedding: true, ...(exceptEventId ? { id: { not: exceptEventId } } : {}) },
    data: { isWedding: false },
  });
}

export async function createEvent(formData: FormData): Promise<EventFormState> {
  const account = await requireCurrentAccount();

  const parsed = parseEventForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  if (parsed.data.isWedding) await clearOtherWeddingFlags(account.id);

  await prisma.event.create({
    data: {
      accountId: account.id,
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
      isWedding: parsed.data.isWedding,
    },
  });

  revalidatePath("/admin/eventos");
  return {};
}

export async function updateEvent(eventId: string, formData: FormData): Promise<EventFormState> {
  const account = await requireCurrentAccount();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.accountId !== account.id) return { error: "Evento não encontrado" };

  const parsed = parseEventForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  if (parsed.data.isWedding) await clearOtherWeddingFlags(account.id, eventId);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
      isWedding: parsed.data.isWedding,
    },
  });

  revalidatePath("/admin/eventos");
  return {};
}

export async function deleteEvent(eventId: string): Promise<EventFormState> {
  const account = await requireCurrentAccount();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.accountId !== account.id) return { error: "Evento não encontrado" };

  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/eventos");
  return {};
}
