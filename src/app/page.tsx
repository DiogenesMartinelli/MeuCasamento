import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    title: "Pix e cartão direto na conta",
    description:
      "Convidados presenteiam com Pix dinâmico ou cartão, sem sair do site. Você recebe direto na sua conta.",
  },
  {
    title: "RSVP por família",
    description:
      "Um único link confirma toda a família de uma vez. Organize convidados por evento e acompanhe quem confirmou.",
  },
  {
    title: "Mural de recados",
    description:
      "Um espaço para os convidados deixarem votos de felicidades. Você modera antes de publicar.",
  },
];

const TEMPLATES = [
  { name: "Clássico", swatch: "bg-stone-800" },
  { name: "Moderno", swatch: "bg-slate-900" },
  { name: "Rústico", swatch: "bg-amber-800" },
  { name: "Boho", swatch: "bg-orange-700" },
  { name: "Minimalista", swatch: "bg-neutral-500" },
  { name: "Romântico", swatch: "bg-rose-700" },
];

export default function Home() {
  return (
    <main>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-serif text-xl font-semibold tracking-tight">MeuCasamento</span>
        <div className="hidden gap-8 text-sm font-medium uppercase tracking-widest text-muted-foreground md:flex">
          <a href="#recursos" className="transition-colors hover:text-foreground">
            Recursos
          </a>
          <a href="#personalizacao" className="transition-colors hover:text-foreground">
            Personalização
          </a>
          <a href="#preco" className="transition-colors hover:text-foreground">
            Preço
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/admin/login">Entrar</Link>}
          />
          <Button nativeButton={false} render={<Link href="/comecar">Criar Meu Site</Link>} />
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <h1 className="text-balance font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
          A elegância de um site <em className="italic">sob medida</em> para o seu casamento.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Site editorial, RSVP por família e lista de presentes com Pix e cartão, tudo em um
          painel simples de administrar.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/comecar">Criar Meu Site</Link>} />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/login">Entrar</Link>}
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-28 sm:pb-36 md:pb-44">
        <div className="relative">
          <Card className="overflow-hidden py-0 shadow-lg">
            <CardContent className="flex flex-col gap-6 p-8 sm:pr-[250px] md:pr-[310px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Painel do casal
                  </p>
                  <h3 className="font-serif text-2xl">Sofia &amp; Ricardo</h3>
                </div>
                <div className="hidden gap-6 sm:flex">
                  <div className="text-center">
                    <span className="block text-xl font-medium">142</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Confirmados</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-medium">R$ 12,4k</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Arrecadado</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-medium">38</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Recados</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <span className="text-sm font-medium">Presente: Jogo de Jantar</span>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    Recebido via Pix
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <span className="text-sm font-medium">RSVP: Família Souza (4 pessoas)</span>
                  <Badge variant="secondary">Pendente</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <span className="text-sm font-medium">Mural: 3 recados aguardando</span>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    Moderar
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example of what a guest sees when opening the couple's link on their phone.
              The card content reserves right padding (sm:pr-48 md:pr-56) so nothing
              sits under this overlapping mockup. */}
          <div className="absolute -bottom-12 right-2 hidden w-56 sm:block md:-bottom-20 md:right-8 md:w-64">
            <p className="mb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              No celular do convidado ↴
            </p>
            <div className="h-[420px] overflow-hidden rounded-[2rem] border-[6px] border-foreground bg-background shadow-2xl md:h-[480px]">
              <div className="flex h-full flex-col">
                <div className="relative flex h-32 shrink-0 flex-col items-center justify-center gap-1 bg-gradient-to-br from-stone-800 via-stone-900 to-black px-4 text-center text-white md:h-36">
                  <span className="font-serif text-lg italic">Sofia &amp; Ricardo</span>
                  <span className="text-[9px] uppercase tracking-widest text-white/70">
                    22 de Junho, 2026
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 px-4 py-5 text-left">
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      ["124", "dias"],
                      ["18", "hrs"],
                      ["42", "min"],
                      ["09", "seg"],
                    ].map(([n, l]) => (
                      <div key={l} className="rounded-md bg-muted p-1.5">
                        <span className="block text-xs font-semibold">{n}</span>
                        <span className="text-[7px] uppercase text-muted-foreground">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full rounded-md bg-primary py-2 text-center text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    Confirmar Presença
                  </div>
                  <div className="border-t pt-3">
                    <p className="mb-2 text-[9px] font-semibold uppercase text-muted-foreground">
                      Presentes em Pix
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-[10px]">
                        <span>Lua de Mel</span>
                        <span className="font-semibold text-primary">R$ 200</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-[10px]">
                        <span>Jantar romântico</span>
                        <span className="font-semibold text-primary">R$ 120</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-primary/40">
              <div className="size-2 rounded-full bg-primary" />
            </div>
            <h3 className="font-serif text-xl">{feature.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>

      <section id="personalizacao" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-balance font-serif text-3xl sm:text-4xl">
              Um estilo para cada história.
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Seis estilos prontos ou personalize cada cor do zero — fundo, texto, cards e bordas.
              Sem parecer um modelo genérico.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary" />
                Tipografia editorial em cada template
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary" />
                Cores, fundo e formato do card 100% customizáveis
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary" />
                Preview ao vivo enquanto você edita
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary" />
                Um painel por casal — múltiplos casamentos, uma plataforma
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <div key={template.name} className="flex flex-col items-center gap-2">
                <div className={`h-24 w-full rounded-lg ${template.swatch}`} />
                <span className="text-xs text-muted-foreground">{template.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="border-t py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            Plano único, sem letras miúdas
          </p>
          <h2 className="mb-6 font-serif text-4xl italic">R$ 49,90 por casamento</h2>
          <p className="mb-10 text-muted-foreground">
            Site sob medida, RSVP, lista de presentes com Pix e cartão, mural de recados moderado
            e painel administrativo — tudo incluso, sem mensalidade.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="/comecar">Começar Agora</Link>} />
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
          <span className="font-serif italic">MeuCasamento</span>
          <p className="text-xs uppercase tracking-widest">Feito com carinho no Brasil</p>
        </div>
      </footer>
    </main>
  );
}
