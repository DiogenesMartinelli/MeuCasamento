"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";
import { uploadImage } from "@/lib/storage";
import { SITE_TEMPLATES } from "@/lib/site-templates";
import { GIFT_CARD_SHAPE_OPTIONS } from "@/lib/accent-color";
import type { SiteTemplate, GiftCardShape } from "@/generated/prisma/client";

export type SiteSettingsFormState = { error?: string; success?: boolean };

const templateIds = SITE_TEMPLATES.map((t) => t.id) as [SiteTemplate, ...SiteTemplate[]];
const shapeIds = GIFT_CARD_SHAPE_OPTIONS.map((s) => s.id) as [GiftCardShape, ...GiftCardShape[]];

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

const textSchema = z.object({
  coupleName: z.string().trim().min(1, "Informe o nome do casal").max(120),
  welcomeMessage: z.string().trim().max(500),
  template: z.enum(templateIds),
  declineMessage: z.string().trim().min(1, "Escreva a mensagem de recusa").max(500),
  accentColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  giftCardShape: z.enum(shapeIds),
});

async function uploadIfPresent(file: FormDataEntryValue | null, accountId: string, field: string) {
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `accounts/${accountId}/${field}-${Date.now()}.${ext}`;
  return uploadImage(file, path);
}

export async function updateSiteSettings(
  _prevState: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  const account = await requireCurrentAccount();

  const parsed = textSchema.safeParse({
    coupleName: formData.get("coupleName"),
    welcomeMessage: formData.get("welcomeMessage"),
    template: formData.get("template"),
    declineMessage: formData.get("declineMessage"),
    accentColor: formData.get("accentColor"),
    backgroundColor: formData.get("backgroundColor"),
    textColor: formData.get("textColor"),
    giftCardShape: formData.get("giftCardShape"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const [backgroundImageUrl, bannerImageUrl, profileImageUrl] = await Promise.all([
      uploadIfPresent(formData.get("backgroundImage"), account.id, "background"),
      uploadIfPresent(formData.get("bannerImage"), account.id, "banner"),
      uploadIfPresent(formData.get("profileImage"), account.id, "profile"),
    ]);

    await prisma.siteSettings.upsert({
      where: { accountId: account.id },
      create: {
        accountId: account.id,
        coupleName: parsed.data.coupleName,
        welcomeMessage: parsed.data.welcomeMessage,
        template: parsed.data.template,
        declineMessage: parsed.data.declineMessage,
        accentColor: parsed.data.accentColor ?? null,
        backgroundColor: parsed.data.backgroundColor ?? null,
        textColor: parsed.data.textColor ?? null,
        giftCardShape: parsed.data.giftCardShape,
        backgroundImageUrl,
        bannerImageUrl,
        profileImageUrl,
      },
      update: {
        coupleName: parsed.data.coupleName,
        welcomeMessage: parsed.data.welcomeMessage,
        template: parsed.data.template,
        declineMessage: parsed.data.declineMessage,
        accentColor: parsed.data.accentColor ?? null,
        backgroundColor: parsed.data.backgroundColor ?? null,
        textColor: parsed.data.textColor ?? null,
        giftCardShape: parsed.data.giftCardShape,
        ...(backgroundImageUrl ? { backgroundImageUrl } : {}),
        ...(bannerImageUrl ? { bannerImageUrl } : {}),
        ...(profileImageUrl ? { profileImageUrl } : {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar";
    return { error: message };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath(`/c/${account.slug}`);
  return { success: true };
}
