# MeuCasamento

Plataforma para sites e gestão de casamentos: cada casal cria sua própria conta (multi-tenant),
personaliza o site em `/c/[slug]`, gerencia convidados com RSVP, lista de presentes com
checkout via Mercado Pago (Pix e cartão) e um mural de recados moderável.

## Stack

- **Next.js 16 (App Router)** + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **PostgreSQL via Supabase** + **Prisma ORM**
- **Supabase Auth** (login do painel admin) e **Supabase Storage** (upload de imagens)
- **Mercado Pago SDK** (Checkout Pro + Pix dinâmico) com webhook de confirmação
- **Cheerio** para scraping de `og:title` / `og:image` de links de lojas

## Estrutura

```
src/
  app/
    page.tsx                       Landing page da plataforma
    c/[slug]/                      Site público do casamento (hero, mural, eventos)
    c/[slug]/rsvp/[familyToken]/   Confirmação de presença por família
    c/[slug]/presentes/           Lista de presentes + checkout
    admin/(auth)/                 Login, cadastro, onboarding
    admin/(dashboard)/            Painel: configurações, eventos, convidados, presentes, recados
    api/scrape-link/              Scraping de og:title/og:image (protegido, uso interno do admin)
    api/gifts/[giftId]/checkout/  Cria pagamento (Pix ou Checkout Pro) no Mercado Pago
    api/payments/[paymentId]/status/  Polling de status de pagamento (usado pelo modal de Pix)
    api/webhooks/mercadopago/     Webhook que confirma pagamentos e marca presentes como PURCHASED
  components/
    public/                       Componentes do site público
    admin/                        Componentes do painel administrativo
    ui/                           Componentes shadcn/ui
  lib/
    actions/                      Server Actions (mutações: guests, gifts, events, auth, etc.)
    queries/                      Leituras via Prisma usadas pelos Server Components
    supabase/                     Clients Supabase (browser, server, middleware)
    prisma.ts, storage.ts, mercadopago.ts, current-account.ts
prisma/schema.prisma              Modelagem do banco (ver abaixo)
```

### Modelo de dados

`Account` é o "casamento" em si (multi-tenant) e é dono de `SiteSettings`, `Event[]` e
`GuestMessage[]`. `Guest` e `Gift` pertencem a um `Event`. Convidados da mesma família
compartilham o mesmo `familyToken`, que gera o link único `/c/[slug]/rsvp/[familyToken]`.
`Payment` guarda cada tentativa de checkout de uma cota em dinheiro (`Gift` do tipo
`CASH_QUOTA`) e é o que o webhook do Mercado Pago atualiza.

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → Database**, copie a *connection string* pooled (porta 6543) para
   `DATABASE_URL` e a direta (porta 5432) para `DIRECT_URL`.
3. Em **Project Settings → API**, copie `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   e `SUPABASE_SERVICE_ROLE_KEY`.
4. Em **Authentication → Providers**, deixe Email/Password habilitado. Para testar localmente
   sem configurar SMTP, desative "Confirm email" em **Authentication → Settings** (em produção,
   mantenha a confirmação por e-mail ativada).
5. Em **Storage**, crie um bucket público com o mesmo nome de `SUPABASE_STORAGE_BUCKET`
   (padrão `meucasamento`) - é onde vão as imagens do site (background, banner, perfil).

Copie `.env.example` para `.env` e preencha todos os valores.

### 2. Banco de dados (Prisma)

```bash
npm install
npx prisma migrate dev --name init
```

Isso cria as tabelas no Supabase e gera o Prisma Client em `src/generated/prisma`
(a geração também roda automaticamente no `postinstall`).

### 3. Mercado Pago

1. Crie uma aplicação em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel/app)
   e copie o **Access Token** (use o de teste, `TEST-...`, para desenvolvimento) para
   `MERCADOPAGO_ACCESS_TOKEN`.
2. Configure a assinatura do webhook (**Webhooks → Configurar notificações**) e copie a chave
   secreta para `MERCADOPAGO_WEBHOOK_SECRET`. Sem essa variável, o endpoint do webhook aceita
   notificações sem validar assinatura (aceitável só em desenvolvimento local).
3. Aponte a URL de notificação para `https://SEU_DOMINIO/api/webhooks/mercadopago` (em
   desenvolvimento local, use um túnel como `ngrok` e ajuste `NEXT_PUBLIC_APP_URL` de acordo).

### 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`, clique em **Criar meu site**, faça login e complete o
onboarding (nome do casal + endereço `/c/seu-slug`). A partir daí o painel em `/admin` fica
disponível para cadastrar eventos, convidados, presentes e moderar recados.

## Scripts

- `npm run dev` - servidor de desenvolvimento
- `npm run build` / `npm run start` - build e start de produção
- `npm run db:push` - aplica o schema no banco sem gerar migration (prototipagem rápida)
- `npm run db:migrate` - cria/aplica migrations versionadas (recomendado antes de deploy)
- `npm run db:studio` - abre o Prisma Studio para inspecionar os dados

## Deploy

O projeto é stateless e funciona bem na Vercel:

1. Suba o repositório no GitHub e importe o projeto na Vercel.
2. Configure as mesmas variáveis de `.env.example` nas *Environment Variables* do projeto.
3. Atualize `NEXT_PUBLIC_APP_URL` para o domínio final (usado nos `back_urls` e
   `notification_url` do Mercado Pago).
4. Reaponte o webhook do Mercado Pago para a URL de produção.

## Notas de segurança

- `/api/scrape-link` exige sessão de admin autenticada (evita virar um proxy aberto de SSRF) e
  bloqueia hosts privados/locais.
- O webhook do Mercado Pago valida a assinatura (`x-signature`/`x-request-id`) quando
  `MERCADOPAGO_WEBHOOK_SECRET` está configurado, e sempre busca o pagamento diretamente na API
  do Mercado Pago em vez de confiar no corpo da notificação.
- Toda Server Action de escrita (convidados, presentes, eventos, recados) revalida que o
  registro pertence à conta do usuário autenticado antes de alterar ou excluir.
