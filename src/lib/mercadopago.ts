import { MercadoPagoConfig } from "mercadopago";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

/** The Mercado Pago SDK rejects with plain API error objects, not Error instances. */
export function mpErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return fallback;
}

/**
 * `auto_return` requires `back_urls.success` to be a fully-qualified https URL,
 * so it must be omitted when running against a plain-http origin (local dev).
 */
export function autoReturnFor(appUrl: string): "approved" | undefined {
  return appUrl.startsWith("https://") ? "approved" : undefined;
}
