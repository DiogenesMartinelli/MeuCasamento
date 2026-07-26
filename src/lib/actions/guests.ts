"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";

export type GuestFormState = { error?: string };

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .optional()
  .transform((v) => (v ? v : undefined));

const createSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do convidado").max(120),
  eventId: z.string().min(1, "Selecione um evento"),
  familyToken: z.string().min(1),
  phone: phoneSchema,
});

const updateSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do convidado").max(120),
  eventId: z.string().min(1, "Selecione um evento"),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED"]),
  phone: phoneSchema,
});

export async function createGuest(formData: FormData): Promise<GuestFormState> {
  const account = await requireCurrentAccount();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    eventId: formData.get("eventId"),
    familyToken: formData.get("familyToken"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event || event.accountId !== account.id) return { error: "Evento não encontrado" };

  let familyToken = parsed.data.familyToken;
  if (familyToken === "new") {
    familyToken = crypto.randomUUID();
  } else {
    const existing = await prisma.guest.findFirst({
      where: { familyToken, accountId: account.id },
    });
    if (!existing) return { error: "Família não encontrada" };
  }

  await prisma.guest.create({
    data: {
      accountId: account.id,
      name: parsed.data.name,
      eventId: parsed.data.eventId,
      familyToken,
      phone: parsed.data.phone,
    },
  });

  revalidatePath("/admin/convidados");
  return {};
}

export async function updateGuest(guestId: string, formData: FormData): Promise<GuestFormState> {
  const account = await requireCurrentAccount();

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest || guest.accountId !== account.id) return { error: "Convidado não encontrado" };

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    eventId: formData.get("eventId"),
    status: formData.get("status"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event || event.accountId !== account.id) return { error: "Evento não encontrado" };

  await prisma.guest.update({
    where: { id: guestId },
    data: {
      name: parsed.data.name,
      eventId: parsed.data.eventId,
      status: parsed.data.status,
      phone: parsed.data.phone ?? null,
      respondedAt: parsed.data.status === "PENDING" ? null : new Date(),
    },
  });

  revalidatePath("/admin/convidados");
  return {};
}

export async function deleteGuest(guestId: string): Promise<GuestFormState> {
  const account = await requireCurrentAccount();

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest || guest.accountId !== account.id) return { error: "Convidado não encontrado" };

  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath("/admin/convidados");
  return {};
}
