"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";

export type GiftFormState = { error?: string };

const baseSchema = z.object({
  title: z.string().trim().min(1, "Informe o título do presente").max(200),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  eventId: z.string().min(1, "Selecione um evento"),
  type: z.enum(["PHYSICAL_LINK", "CASH_QUOTA"]),
  productUrl: z.string().trim().url().optional().or(z.literal("")),
  price: z.string().optional(),
});

function parseGiftForm(formData: FormData) {
  const parsed = baseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    eventId: formData.get("eventId"),
    type: formData.get("type"),
    productUrl: formData.get("productUrl") || "",
    price: formData.get("price") || undefined,
  });

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;

  if (data.type === "PHYSICAL_LINK" && !data.productUrl) {
    return { success: false as const, error: "Informe o link do produto" };
  }

  let price: number | null = null;
  if (data.type === "CASH_QUOTA") {
    price = Number(data.price);
    if (!data.price || Number.isNaN(price) || price <= 0) {
      return { success: false as const, error: "Informe um valor válido para a cota" };
    }
  }

  return { success: true as const, data, price };
}

export async function createGift(formData: FormData): Promise<GiftFormState> {
  const account = await requireCurrentAccount();

  const parsed = parseGiftForm(formData);
  if (!parsed.success) return { error: parsed.error };

  const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event || event.accountId !== account.id) return { error: "Evento não encontrado" };

  await prisma.gift.create({
    data: {
      accountId: account.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      eventId: parsed.data.eventId,
      type: parsed.data.type,
      productUrl: parsed.data.type === "PHYSICAL_LINK" ? parsed.data.productUrl || null : null,
      price: parsed.price,
    },
  });

  revalidatePath("/admin/presentes");
  return {};
}

export async function updateGift(giftId: string, formData: FormData): Promise<GiftFormState> {
  const account = await requireCurrentAccount();

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.accountId !== account.id) return { error: "Presente não encontrado" };

  const parsed = parseGiftForm(formData);
  if (!parsed.success) return { error: parsed.error };

  const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event || event.accountId !== account.id) return { error: "Evento não encontrado" };

  await prisma.gift.update({
    where: { id: giftId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      eventId: parsed.data.eventId,
      type: parsed.data.type,
      productUrl: parsed.data.type === "PHYSICAL_LINK" ? parsed.data.productUrl || null : null,
      price: parsed.price,
    },
  });

  revalidatePath("/admin/presentes");
  return {};
}

export async function setGiftStatus(giftId: string, status: "AVAILABLE" | "PURCHASED"): Promise<GiftFormState> {
  const account = await requireCurrentAccount();

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.accountId !== account.id) return { error: "Presente não encontrado" };

  await prisma.gift.update({ where: { id: giftId }, data: { status } });
  revalidatePath("/admin/presentes");
  return {};
}

export async function deleteGift(giftId: string): Promise<GiftFormState> {
  const account = await requireCurrentAccount();

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.accountId !== account.id) return { error: "Presente não encontrado" };

  await prisma.gift.delete({ where: { id: giftId } });
  revalidatePath("/admin/presentes");
  return {};
}
