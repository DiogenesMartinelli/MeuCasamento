import { Resend } from "resend";

/** Sender address for all transactional email - must be on a domain verified in Resend. */
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "MeuCasamento <onboarding@resend.dev>";

let client: Resend | undefined;

/** Lazy singleton so importing this module doesn't crash when RESEND_API_KEY is unset
 * (e.g. during `next build`'s static page-data collection). */
function getResend() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export const resend = {
  emails: {
    send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args),
  },
};
