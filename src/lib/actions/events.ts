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
});

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    description: formData.get("description") || undefined,
  });
}

export async function createEvent(formData: FormData): Promise<EventFormState> {
  const account = await requireCurrentAccount();

  const parsed = parseEventForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.event.create({
    data: {
      accountId: account.id,
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
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

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
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
