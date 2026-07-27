import { addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resend, EMAIL_FROM } from "@/lib/email";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

async function getOwnerEmail(ownerUserId: string): Promise<string | null> {
  const admin = createServiceRoleClient();
  const { data } = await admin.auth.admin.getUserById(ownerUserId);
  return data.user?.email ?? null;
}

function reminderEmailHtml(coupleName: string, slug: string, expiresAt: Date, monthsLeft: 1 | 2) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const prazo = monthsLeft === 2 ? "2 meses" : "1 mês";

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Seu plano MeuCasamento vence em ${prazo}</h1>
      <p>Olá, ${coupleName}!</p>
      <p>
        O acesso ao site de vocês (<strong>/c/${slug}</strong>) vence em
        <strong>${dateFormatter.format(expiresAt)}</strong>.
      </p>
      <p>
        Para continuar usando a plataforma sem interrupção - mantendo todos os convidados,
        presentes e recados já cadastrados - renove por mais 12 meses antes dessa data.
      </p>
      <p>
        <a href="${appUrl}/admin" style="display:inline-block;background:#1e2620;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
          Renovar agora
        </a>
      </p>
      <p style="color:#666;font-size:13px;">
        Se o plano vencer sem renovação, enviaremos uma cópia de todos os seus dados por e-mail
        e a conta será encerrada.
      </p>
    </div>
  `;
}

function expirationEmailHtml(coupleName: string, slug: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Seu contrato MeuCasamento chegou ao fim</h1>
      <p>Olá, ${coupleName}!</p>
      <p>
        O período de 12 meses do site de vocês (<strong>/c/${slug}</strong>) terminou sem
        renovação. Em anexo está uma cópia de todos os dados que estavam cadastrados -
        convidados, presentes, recados e configurações do site.
      </p>
      <p>
        Conforme os Termos de Uso aceitos no cadastro, a conta e todos os dados foram
        permanentemente excluídos da plataforma.
      </p>
      <p>
        Se quiser usar a MeuCasamento novamente, será necessário fazer um novo cadastro,
        com um novo pagamento, começando do zero.
      </p>
      <p>
        <a href="${appUrl}/comecar" style="display:inline-block;background:#1e2620;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
          Criar um novo site
        </a>
      </p>
    </div>
  `;
}

/** Sends the "expires in ~2 months" reminder to every account that's due one. Idempotent. */
export async function sendTwoMonthReminders() {
  const now = new Date();
  const accounts = await prisma.account.findMany({
    where: {
      expiresAt: { not: null, gt: now, lte: addMonths(now, 2) },
      reminderTwoMonthsSentAt: null,
    },
    include: { siteSettings: true },
  });

  let sent = 0;
  for (const account of accounts) {
    if (!account.expiresAt) continue;
    const email = await getOwnerEmail(account.ownerUserId);
    if (!email) continue;

    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Seu plano MeuCasamento vence em 2 meses",
      html: reminderEmailHtml(account.siteSettings?.coupleName || "casal", account.slug, account.expiresAt, 2),
    });

    await prisma.account.update({
      where: { id: account.id },
      data: { reminderTwoMonthsSentAt: new Date() },
    });
    sent += 1;
  }
  return sent;
}

/** Sends the "expires in ~1 month" reminder to every account that's due one. Idempotent. */
export async function sendOneMonthReminders() {
  const now = new Date();
  const accounts = await prisma.account.findMany({
    where: {
      expiresAt: { not: null, gt: now, lte: addMonths(now, 1) },
      reminderOneMonthSentAt: null,
    },
    include: { siteSettings: true },
  });

  let sent = 0;
  for (const account of accounts) {
    if (!account.expiresAt) continue;
    const email = await getOwnerEmail(account.ownerUserId);
    if (!email) continue;

    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Seu plano MeuCasamento vence em 1 mês",
      html: reminderEmailHtml(account.siteSettings?.coupleName || "casal", account.slug, account.expiresAt, 1),
    });

    await prisma.account.update({
      where: { id: account.id },
      data: { reminderOneMonthSentAt: new Date() },
    });
    sent += 1;
  }
  return sent;
}

/**
 * Exports and emails every expired account's data, then permanently deletes the
 * Supabase user and the Account (which cascades to everything else).
 */
export async function processExpiredAccounts() {
  const now = new Date();
  const accounts = await prisma.account.findMany({
    where: { expiresAt: { not: null, lte: now } },
    include: {
      siteSettings: true,
      events: { include: { guests: true, gifts: { include: { payments: true } } } },
      guestMessages: true,
    },
  });

  let processed = 0;
  for (const account of accounts) {
    const email = await getOwnerEmail(account.ownerUserId);
    const coupleName = account.siteSettings?.coupleName || "casal";

    if (email) {
      const exportPayload = {
        exportedAt: now.toISOString(),
        account: { slug: account.slug, createdAt: account.createdAt, expiresAt: account.expiresAt },
        siteSettings: account.siteSettings,
        events: account.events,
        guestMessages: account.guestMessages,
      };

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Seus dados MeuCasamento (contrato encerrado)",
        html: expirationEmailHtml(coupleName, account.slug),
        attachments: [
          {
            filename: `meucasamento-${account.slug}-dados.json`,
            content: Buffer.from(JSON.stringify(exportPayload, null, 2)),
          },
        ],
      });
    }

    const admin = createServiceRoleClient();
    await admin.auth.admin.deleteUser(account.ownerUserId);
    await prisma.account.delete({ where: { id: account.id } });

    processed += 1;
  }

  return processed;
}
