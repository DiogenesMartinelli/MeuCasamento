import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationCheckoutForm } from "@/components/public/registration-checkout-form";

export const metadata: Metadata = { title: "Criar meu site — MeuCasamento" };

export default function ComecarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            Vamos criar o site do seu casamento
          </CardTitle>
          <CardDescription>
            Pagamento único de R$ 49,90 para liberar seu acesso. Sem mensalidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationCheckoutForm />
        </CardContent>
      </Card>
    </main>
  );
}
