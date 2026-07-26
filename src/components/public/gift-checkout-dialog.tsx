"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SerializedGift } from "@/lib/queries/gifts";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type CheckoutResult =
  | { method: "pix"; paymentId: string; qrCode: string | null; qrCodeBase64: string | null }
  | { method: "checkout_pro"; paymentId: string; initPoint: string };

export function GiftCheckoutDialog({
  gift,
  open,
  onOpenChange,
}: {
  gift: SerializedGift;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [loading, setLoading] = useState<"pix" | "checkout_pro" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [paid, setPaid] = useState(false);

  function pollStatus(paymentId: string) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/payments/${paymentId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "APPROVED") {
            setPaid(true);
            clearInterval(interval);
          }
        }
      } catch {
        // transient network error - keep polling until attempts run out
      }
      if (attempts > 40) clearInterval(interval);
    }, 5000);
  }

  async function startCheckout(method: "pix" | "checkout_pro") {
    if (!payerName.trim() || !payerEmail.trim()) {
      setError("Preencha seu nome e e-mail");
      return;
    }
    setError(null);
    setLoading(method);
    try {
      const res = await fetch(`/api/gifts/${gift.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, payerName, payerEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao iniciar pagamento");

      if (method === "checkout_pro") {
        window.location.href = data.initPoint;
        return;
      }
      setResult(data);
      pollStatus(data.paymentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar pagamento");
    } finally {
      setLoading(null);
    }
  }

  function handleOpenChange(value: boolean) {
    onOpenChange(value);
    if (!value) {
      setResult(null);
      setError(null);
      setPaid(false);
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{gift.title}</DialogTitle>
          <DialogDescription>
            {gift.price ? `Cota de ${currency.format(Number(gift.price))}` : ""}
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <p className="py-6 text-center font-medium text-green-600 dark:text-green-400">
            Pagamento confirmado! Muito obrigado pelo carinho 💚
          </p>
        ) : result?.method === "pix" ? (
          <div className="flex flex-col items-center gap-4">
            {result.qrCodeBase64 && (
              <Image
                src={`data:image/png;base64,${result.qrCodeBase64}`}
                alt="QR Code Pix"
                width={220}
                height={220}
                unoptimized
              />
            )}
            {result.qrCode && (
              <div className="w-full">
                <Label className="text-xs">Pix copia e cola</Label>
                <div className="mt-1 flex gap-2">
                  <Input readOnly value={result.qrCode} className="text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(result.qrCode!)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Assim que o pagamento for confirmado esta janela atualiza automaticamente.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="payerName">Seu nome</Label>
              <Input id="payerName" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="payerEmail">Seu e-mail</Label>
              <Input
                id="payerEmail"
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" disabled={loading !== null} onClick={() => startCheckout("pix")}>
                {loading === "pix" ? "Gerando..." : "Pagar com Pix"}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={loading !== null}
                onClick={() => startCheckout("checkout_pro")}
              >
                {loading === "checkout_pro" ? "Redirecionando..." : "Cartão de crédito"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
