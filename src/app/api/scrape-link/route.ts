import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { getCurrentUser } from "@/lib/current-account";

const MAX_BODY_BYTES = 5_000_000; // 5MB
const FETCH_TIMEOUT_MS = 8000;

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1"]);

function isPrivateOrLocalHostname(hostname: string) {
  const host = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".local")) return true;

  // IPv4 literal checks (best-effort SSRF guard - not a substitute for network-level egress control)
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 0) return true;
  }

  return false;
}

function resolveUrl(maybeRelative: string | undefined, base: URL) {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const url = (body as { url?: unknown })?.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Campo 'url' é obrigatório" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ error: "Protocolo não suportado" }, { status: 400 });
  }

  if (isPrivateOrLocalHostname(target.hostname)) {
    return NextResponse.json({ error: "Host não permitido" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(target.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MeuCasamentoBot/1.0; +link-preview)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Falha ao acessar o link (HTTP ${res.status})` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
      return NextResponse.json({ error: "O link não retornou uma página HTML" }, { status: 415 });
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Página muito grande para analisar" }, { status: 413 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").first().text() ||
      "";

    const rawImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[property="og:image:secure_url"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      "";

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const price =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('meta[itemprop="price"]').attr("content") ||
      null;

    return NextResponse.json({
      title: title.trim().slice(0, 300),
      imageUrl: resolveUrl(rawImage, target),
      description: description.trim().slice(0, 1000),
      price,
      sourceUrl: target.toString(),
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Tempo esgotado ao acessar o link" : "Não foi possível ler o link" },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
