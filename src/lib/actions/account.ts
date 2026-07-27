"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-account";
import { slugify } from "@/lib/slugify";

export type CreateAccountFormState = { error?: string };

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
