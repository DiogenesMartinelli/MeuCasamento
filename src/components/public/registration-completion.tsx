"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { completeRegistration } from "@/lib/actions/registration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentStatus } from "@/generated/prisma/client";

export function RegistrationCompletion({
  registrationPaymentId,
  initialStatus,
  initialUsed,
  email,
}: {
  registrationPaymentId: string;
  initialStatus: PaymentStatus;
  initialUsed: boolean;
  email: string;
}) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [used] = useState(initialUsed);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "APPROVED" || used) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/registration/${registrationPaymentId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
        }
      } catch {
        // transient network error - keep polling until it recovers
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [status, used, registrationPaymentId]);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await completeRegistration(registrationPaymentId, {}, formData);
      if (result?.error) setError(result.error);
    });
  }

  if (used) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Este pagamento já foi usado</CardTitle>
          <CardDescription>Sua conta já existe. Faça login para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link href="/admin/login">Ir para o login</Link>} />
        </CardContent>
      </Card>
    );
  }

  if (status !== "APPROVED") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Confirmando seu pagamento...</CardTitle>
          <CardDescription>
            Isso costuma levar poucos segundos. Não feche esta página.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Pagamento confirmado!</CardTitle>
        <CardDescription>Crie sua senha para acessar o painel de {email}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupleName">Nome do casal</Label>
            <Input id="coupleName" name="coupleName" placeholder="João & Maria" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Crie uma senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar minha conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
