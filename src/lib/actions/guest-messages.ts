"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";

const messageSchema = z.object({
  authorName: z.string().trim().min(1, "Informe seu nome").max(80),
  content: z.string().trim().min(1, "Escreva uma mensagem").max(500),
});

export type GuestMessageFormState = {
  error?: string;
  success?: boolean;
};

/** Public action: any visitor of a wedding's site can leave a message. */
export async function createGuestMessage(
  accountId: string,
  slug: string,
  _prevState: GuestMessageFormState,
  formData: FormData,
): Promise<GuestMessageFormState> {
  const parsed = messageSchema.safeParse({
    authorName: formData.get("authorName"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const account = await prisma.account.findUnique({ where: { id: accountId }, select: { id: true } });
  if (!account) {
    return { error: "Site não encontrado" };
  }

  await prisma.guestMessage.create({
    data: {
      accountId,
      authorName: parsed.data.authorName,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/c/${slug}`);
  return { success: true };
}

/** Admin action: hide/show a message. Verifies the message belongs to the caller's account. */
export async function setGuestMessageVisibility(messageId: string, isVisible: boolean) {
  const account = await requireCurrentAccount();

  const message = await prisma.guestMessage.findUnique({ where: { id: messageId } });
  if (!message || message.accountId !== account.id) {
    throw new Error("Recado não encontrado");
  }

  await prisma.guestMessage.update({ where: { id: messageId }, data: { isVisible } });
  revalidatePath("/admin/recados");
}

/** Admin action: permanently delete a message. */
export async function deleteGuestMessage(messageId: string) {
  const account = await requireCurrentAccount();

  const message = await prisma.guestMessage.findUnique({ where: { id: messageId } });
  if (!message || message.accountId !== account.id) {
    throw new Error("Recado não encontrado");
  }

  await prisma.guestMessage.delete({ where: { id: messageId } });
  revalidatePath("/admin/recados");
}
