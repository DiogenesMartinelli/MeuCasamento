import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="max-w-xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          MeuCasamento
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Crie o site do seu casamento: confirmação de presença, lista de presentes com Pix e
          mural de recados, tudo em um só lugar.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" render={<Link href="/admin/signup">Criar meu site</Link>} />
        <Button size="lg" variant="outline" render={<Link href="/admin/login">Entrar</Link>} />
      </div>
    </main>
  );
}
