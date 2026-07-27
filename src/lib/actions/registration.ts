"use server";

import { redirect } from "next/navigation";
import { addMonths } from "date-fns";
import { z } from "zod";
import { Preference as MPPreference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { mercadopago, mpErrorMessage, autoReturnFor } from "@/lib/mercadopago";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser, requireCurrentAccount } from "@/lib/current-account";
import { slugify } from "@/lib/slugify";
import { TERMS_VERSION } from "@/lib/terms";

/** One-time fee for a new signup or a 12-month renewal. Platform revenue, card-only. */
const REGISTRATION_FEE = 49.9;

async function createCardOnlyPreference(opts: {
  title: string;
  email: string;
  externalReference: string;
  backUrl: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const preference = new MPPreference(mercadopago);
  const result = await preference.create({
    body: {
      items: [
        {
          id: opts.externalReference,
          title: opts.title,
          quantity: 1,
          unit_price: REGISTRATION_FEE,
          currency_id: "BRL",
        },
      ],
      payer: { email: opts.email },
      payment_methods: {
        // Card-only: this is the platform's own fee, not a Pix/boleto gift.
        excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }, { id: "atm" }],
      },
      back_urls: { success: opts.backUrl, pending: opts.backUrl, failure: opts.backUrl },
      auto_return: autoReturnFor(appUrl),
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: opts.externalReference,
    },
  });

  if (!result.init_point) throw new Error("Mercado Pago não retornou o link de pagamento");
  return { initPoint: result.init_point, preferenceId: result.id };
}

export type StartRegistrationState = { error?: string };

const emailSchema = z.string().trim().min(1).email("Informe um e-mail válido");

export async function startRegistrationCheckout(
  _prevState: StartRegistrationState,
  formData: FormData,
): Promise<StartRegistrationState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "E-mail inválido" };
  const email = parsed.data;

  if (!formData.get("termsAccepted")) {
    return { error: "É preciso aceitar os Termos de Uso e Contrato para continuar" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const registrationPayment = await prisma.registrationPayment.create({
    data: {
      email,
      amount: REGISTRATION_FEE,
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
    },
  });

  let initPoint: string;
  try {
    const result = await createCardOnlyPreference({
      title: "Cadastro MeuCasamento",
      email,
      externalReference: registrationPayment.id,
      backUrl: `${appUrl}/comecar/retorno?ref=${registrationPayment.id}`,
    });
    initPoint = result.initPoint;

    await prisma.registrationPayment.update({
      where: { id: registrationPayment.id },
      data: { mpPreferenceId: result.preferenceId },
    });
  } catch (err) {
    await prisma.registrationPayment.update({
      where: { id: registrationPayment.id },
      data: { status: "CANCELLED" },
    });
    return { error: mpErrorMessage(err, "Erro ao iniciar pagamento") };
  }

  redirect(initPoint);
}

export type StartRenewalState = { error?: string };

/** Lets an already-logged-in couple pay again to push their 12-month expiry forward. */
export async function startRenewalCheckout(): Promise<StartRenewalState> {
  const account = await requireCurrentAccount();
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Não foi possível identificar seu e-mail" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const registrationPayment = await prisma.registrationPayment.create({
    data: {
      email: user.email,
      amount: REGISTRATION_FEE,
      accountId: account.id,
    },
  });

  let initPoint: string;
  try {
    const result = await createCardOnlyPreference({
      title: "Renovação MeuCasamento (+12 meses)",
      email: user.email,
      externalReference: registrationPayment.id,
      backUrl: `${appUrl}/admin?renovado=1`,
    });
    initPoint = result.initPoint;

    await prisma.registrationPayment.update({
      where: { id: registrationPayment.id },
      data: { mpPreferenceId: result.preferenceId },
    });
  } catch (err) {
    await prisma.registrationPayment.update({
      where: { id: registrationPayment.id },
      data: { status: "CANCELLED" },
    });
    return { error: mpErrorMessage(err, "Erro ao iniciar pagamento") };
  }

  redirect(initPoint);
}

async function uniqueSlugFor(coupleName: string) {
  const base = slugify(coupleName) || "casal";
  let slug = base;
  let attempt = 2;
  while (await prisma.account.findUnique({ where: { slug } })) {
    slug = `${base}-${attempt}`;
    attempt += 1;
  }
  return slug;
}

export type CompleteRegistrationState = { error?: string };

const completeSchema = z.object({
  coupleName: z.string().trim().min(1, "Informe o nome do casal").max(120),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function completeRegistration(
  registrationPaymentId: string,
  _prevState: CompleteRegistrationState,
  formData: FormData,
): Promise<CompleteRegistrationState> {
  const payment = await prisma.registrationPayment.findUnique({
    where: { id: registrationPaymentId },
  });
  if (!payment) return { error: "Pagamento não encontrado" };
  if (payment.status !== "APPROVED") return { error: "Pagamento ainda não foi confirmado" };
  if (payment.usedAt) {
    return { error: "Este pagamento já foi usado para criar uma conta. Faça login." };
  }

  const parsed = completeSchema.safeParse({
    coupleName: formData.get("coupleName"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const admin = createServiceRoleClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: payment.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    const alreadyExists = createError?.message?.toLowerCase().includes("already");
    return {
      error: alreadyExists
        ? "Este e-mail já tem uma conta. Faça login normalmente."
        : (createError?.message ?? "Erro ao criar usuário"),
    };
  }

  const slug = await uniqueSlugFor(parsed.data.coupleName);

  await prisma.$transaction([
    prisma.account.create({
      data: {
        slug,
        ownerUserId: created.user.id,
        expiresAt: addMonths(new Date(), 12),
        termsAcceptedAt: payment.termsAcceptedAt,
        termsVersion: payment.termsVersion,
        siteSettings: { create: { coupleName: parsed.data.coupleName } },
      },
    }),
    prisma.registrationPayment.update({
      where: { id: payment.id },
      data: { usedAt: new Date() },
    }),
  ]);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: payment.email,
    password: parsed.data.password,
  });
  if (signInError) {
    return { error: "Conta criada, mas houve um erro ao entrar automaticamente. Faça login." };
  }

  redirect("/admin");
}
