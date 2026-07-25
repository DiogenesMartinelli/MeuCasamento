"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";
import { uploadImage } from "@/lib/storage";

export type SiteSettingsFormState = { error?: string; success?: boolean };

const textSchema = z.object({
  coupleName: z.string().trim().min(1, "Informe o nome do casal").max(120),
  welcomeMessage: z.string().trim().max(500),
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
        backgroundImageUrl,
        bannerImageUrl,
        profileImageUrl,
      },
      update: {
        coupleName: parsed.data.coupleName,
        welcomeMessage: parsed.data.welcomeMessage,
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
