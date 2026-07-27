"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentAccount } from "@/lib/current-account";
import { uploadImage } from "@/lib/storage";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  RSVP_ANIMATED_BACKGROUND_OPTIONS,
  RSVP_BACKGROUND_TYPE_OPTIONS,
  RSVP_CONFIRM_ANIMATION_OPTIONS,
  RSVP_FONT_OPTIONS,
  RSVP_LIGHTING_EFFECT_OPTIONS,
} from "@/lib/rsvp-theme";
import type {
  RsvpAnimatedBackground,
  RsvpBackgroundType,
  RsvpConfirmAnimation,
  RsvpFontFamily,
  RsvpLightingEffect,
} from "@/generated/prisma/client";

export type RsvpThemeFormState = { error?: string; success?: boolean };

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "meucasamento";
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

const backgroundTypeIds = RSVP_BACKGROUND_TYPE_OPTIONS.map((o) => o.value) as [
  RsvpBackgroundType,
  ...RsvpBackgroundType[],
];
const animatedBackgroundIds = RSVP_ANIMATED_BACKGROUND_OPTIONS.map((o) => o.value) as [
  RsvpAnimatedBackground,
  ...RsvpAnimatedBackground[],
];
const lightingEffectIds = RSVP_LIGHTING_EFFECT_OPTIONS.map((o) => o.value) as [
  RsvpLightingEffect,
  ...RsvpLightingEffect[],
];
const fontIds = RSVP_FONT_OPTIONS.map((o) => o.value) as [RsvpFontFamily, ...RsvpFontFamily[]];
const confirmAnimationIds = RSVP_CONFIRM_ANIMATION_OPTIONS.map((o) => o.value) as [
  RsvpConfirmAnimation,
  ...RsvpConfirmAnimation[],
];

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

const urlField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

const schema = z.object({
  useCustomStyle: z.boolean(),
  backgroundType: z.enum(backgroundTypeIds),
  backgroundColor: hexColor,
  backgroundGradientTo: hexColor,
  backgroundVideoUrl: urlField,
  animatedBackground: z.enum(animatedBackgroundIds).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  accentColor: hexColor,
  textColor: hexColor,
  mutedTextColor: hexColor,
  cardBackgroundColor: hexColor,
  cardBackgroundGradientTo: hexColor,
  borderColor: hexColor,
  fontFamily: z.enum(fontIds),
  confirmedTextColor: hexColor,
  confirmedFontFamily: z.enum(fontIds).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  lightingEffect: z.enum(lightingEffectIds),
  showSparkles: z.boolean(),
  showStringLights: z.boolean(),
  glassCards: z.boolean(),
  confirmAnimation: z.enum(confirmAnimationIds),
});

async function uploadIfPresent(file: FormDataEntryValue | null, accountId: string, field: string) {
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `accounts/${accountId}/${field}-${Date.now()}.${ext}`;
  return uploadImage(file, path);
}

export async function updateRsvpTheme(
  _prevState: RsvpThemeFormState,
  formData: FormData,
): Promise<RsvpThemeFormState> {
  const account = await requireCurrentAccount();

  const parsed = schema.safeParse({
    useCustomStyle: formData.get("useCustomStyle") === "on",
    backgroundType: formData.get("backgroundType"),
    backgroundColor: formData.get("backgroundColor") ?? "",
    backgroundGradientTo: formData.get("backgroundGradientTo") ?? "",
    backgroundVideoUrl: formData.get("backgroundVideoUrl") ?? "",
    animatedBackground: formData.get("animatedBackground") ?? "",
    accentColor: formData.get("accentColor") ?? "",
    textColor: formData.get("textColor") ?? "",
    mutedTextColor: formData.get("mutedTextColor") ?? "",
    cardBackgroundColor: formData.get("cardBackgroundColor") ?? "",
    cardBackgroundGradientTo: formData.get("cardBackgroundGradientTo") ?? "",
    borderColor: formData.get("borderColor") ?? "",
    fontFamily: formData.get("fontFamily"),
    confirmedTextColor: formData.get("confirmedTextColor") ?? "",
    confirmedFontFamily: formData.get("confirmedFontFamily") ?? "",
    lightingEffect: formData.get("lightingEffect"),
    showSparkles: formData.get("showSparkles") === "on",
    showStringLights: formData.get("showStringLights") === "on",
    glassCards: formData.get("glassCards") === "on",
    confirmAnimation: formData.get("confirmAnimation"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const backgroundImageUrl = await uploadIfPresent(formData.get("backgroundImage"), account.id, "rsvp-background");

    const data = {
      useCustomStyle: parsed.data.useCustomStyle,
      backgroundType: parsed.data.backgroundType,
      backgroundColor: parsed.data.backgroundColor ?? null,
      backgroundGradientTo: parsed.data.backgroundGradientTo ?? null,
      backgroundVideoUrl: parsed.data.backgroundVideoUrl ?? null,
      animatedBackground: parsed.data.animatedBackground ?? null,
      accentColor: parsed.data.accentColor ?? null,
      textColor: parsed.data.textColor ?? null,
      mutedTextColor: parsed.data.mutedTextColor ?? null,
      cardBackgroundColor: parsed.data.cardBackgroundColor ?? null,
      cardBackgroundGradientTo: parsed.data.cardBackgroundGradientTo ?? null,
      borderColor: parsed.data.borderColor ?? null,
      fontFamily: parsed.data.fontFamily,
      confirmedTextColor: parsed.data.confirmedTextColor ?? null,
      confirmedFontFamily: parsed.data.confirmedFontFamily ?? null,
      lightingEffect: parsed.data.lightingEffect,
      showSparkles: parsed.data.showSparkles,
      showStringLights: parsed.data.showStringLights,
      glassCards: parsed.data.glassCards,
      confirmAnimation: parsed.data.confirmAnimation,
      ...(backgroundImageUrl ? { backgroundImageUrl } : {}),
    };

    await prisma.rsvpTheme.upsert({
      where: { accountId: account.id },
      create: { accountId: account.id, ...data },
      update: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar";
    return { error: message };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath(`/c/${account.slug}`);
  revalidatePath("/c/[slug]/rsvp/[familyToken]", "page");
  return { success: true };
}

export type RsvpVideoUploadUrl = { path: string; token: string; publicUrl: string };

/**
 * Videos are uploaded directly from the browser to Supabase Storage using a signed
 * URL instead of through this action's body - Vercel serverless functions cap
 * request bodies at ~4.5MB regardless of Next.js config, so routing a video file
 * through a server action would work locally and fail silently after deploy.
 */
export async function createRsvpVideoUploadUrl(fileName: string, fileSize: number): Promise<RsvpVideoUploadUrl> {
  const account = await requireCurrentAccount();

  if (fileSize > MAX_VIDEO_BYTES) {
    throw new Error("O vídeo precisa ter no máximo 15MB.");
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "mp4";
  const path = `accounts/${account.id}/rsvp-background-${Date.now()}.${ext}`;

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(`Não foi possível preparar o upload do vídeo: ${error?.message ?? "erro desconhecido"}`);
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, token: data.token, publicUrl: publicData.publicUrl };
}
