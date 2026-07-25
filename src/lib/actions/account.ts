"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-account";

export type CreateAccountFormState = { error?: string };

function slugify(input: string) {
  const decomposed = input.normalize("NFD");
  let stripped = "";
  for (const ch of decomposed) {
    const code = ch.codePointAt(0)!;
    // Skip Unicode combining diacritical marks (U+0300-U+036F) produced by NFD normalization.
    if (code >= 0x0300 && code <= 0x036f) continue;
    stripped += ch;
  }

  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export async function createAccount(
  _prevState: CreateAccountFormState,
  formData: FormData,
): Promise<CreateAccountFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const coupleName = String(formData.get("coupleName") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugify(slugInput || coupleName);

  if (!coupleName) return { error: "Informe o nome do casal" };
  if (!slug) return { error: "Informe um endereço válido para o site" };

  const existing = await prisma.account.findUnique({ where: { ownerUserId: user.id } });
  if (existing) redirect("/admin");

  const slugTaken = await prisma.account.findUnique({ where: { slug } });
  if (slugTaken) return { error: "Esse endereço já está em uso, escolha outro" };

  await prisma.account.create({
    data: {
      slug,
      ownerUserId: user.id,
      siteSettings: { create: { coupleName } },
    },
  });

  redirect("/admin");
}
