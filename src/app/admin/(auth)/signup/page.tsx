"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: AuthFormState = {};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.message && <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/admin/login" className="underline underline-offset-2">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
