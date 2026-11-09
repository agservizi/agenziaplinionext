import fs from "node:fs";

fs.writeFileSync(
  "src/lib/gestiio-listini.ts",
  `import "server-only";

/**
 * Public listini from Gestiio (source of truth for CAF/Patronato + Visure prices).
 * SEND/deposito/locker already have dedicated /pricing endpoints.
 */

const DEFAULT_BASE = "https://gestiio.agenziaplinio.it/api/public/client-portal";

export type GestiioListinoRule = {
  id: number;
  serviceType: string;
  label: string;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
  scope?: string;
};

function baseUrl() {
  return (process.env.GESTIIO_CLIENT_PORTAL_BASE_URL || DEFAULT_BASE).replace(/\\/+$/, "");
}

function apiKey() {
  const key =
    process.env.GESTIIO_CLIENT_PORTAL_API_KEY?.trim() ||
    process.env.GESTIIO_SEND_API_KEY?.trim();
  if (!key) throw Object.assign(new Error("GESTIIO_CLIENT_PORTAL_API_KEY non configurata"), { status: 503 });
  return key;
}

async function gestiioGet<T>(path: string): Promise<T> {
  const url = \`\${baseUrl()}\${path.startsWith("/") ? path : \`/\${path}\`}\`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json", "x-api-key": apiKey() },
  });
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    json = null;
  }
  if (!res.ok || json?.success === false) {
    const msg =
      (typeof json?.error === "object" && json.error && "message" in (json.error as object)
        ? String((json.error as { message?: string }).message || "")
        : "") ||
      (typeof json?.message === "string" ? json.message : "") ||
      \`Gestiio listino error (\${res.status})\`;
    throw Object.assign(new Error(msg), { status: res.status >= 400 ? res.status : 502 });
  }
  return (json?.data ?? json) as T;
}

function mapRules(raw: unknown): GestiioListinoRule[] {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { rules?: unknown })?.rules)
      ? ((raw as { rules: unknown[] }).rules)
      : Array.isArray((raw as { items?: unknown })?.items)
        ? ((raw as { items: unknown[] }).items)
        : [];
  return rows
    .map((row, index) => {
      const r = row as Record<string, unknown>;
      const price = Number(
        r.prezzo_cliente ?? r.price_eur ?? r.priceEUR ?? r.price ?? r.amount_eur ?? 0,
      );
      const serviceType = String(r.service_type ?? r.serviceType ?? r.slug ?? r.code ?? "").trim();
      const label = String(r.label ?? r.name ?? r.title ?? serviceType).trim();
      if (!serviceType || !Number.isFinite(price) || price < 0) return null;
      return {
        id: Number(r.id ?? index + 1),
        serviceType,
        label: label || serviceType,
        priceEUR: price,
        sortOrder: Number(r.sort_order ?? r.sortOrder ?? index),
        active: r.active === undefined ? true : Boolean(r.active),
        scope: r.scope ? String(r.scope) : undefined,
      } satisfies GestiioListinoRule;
    })
    .filter((x): x is GestiioListinoRule => Boolean(x));
}

/** Paths overridable when Gestiio finalizes public listini routes. */
export async function fetchGestiioCafPatronatoListino() {
  const path =
    process.env.GESTIIO_CAF_LISTINO_PATH?.trim() || "/listini/caf-patronato";
  const data = await gestiioGet<unknown>(path);
  return mapRules(data);
}

export async function fetchGestiioVisureListino() {
  const path = process.env.GESTIIO_VISURE_LISTINO_PATH?.trim() || "/listini/visure";
  const data = await gestiioGet<unknown>(path);
  return mapRules(data);
}

export async function resolveGestiioListinoPrice(
  rules: GestiioListinoRule[],
  serviceType: string,
) {
  const hit = rules.find(
    (r) => r.active && r.serviceType === serviceType && Number.isFinite(r.priceEUR),
  );
  if (!hit) throw Object.assign(new Error("Tariffa non trovata nel listino Gestiio"), { status: 404 });
  return hit;
}
`,
);

fs.writeFileSync(
  "src/app/api/client-area/caf-patronato/pricing/route.ts",
  `import { NextResponse } from "next/server";
import { fetchGestiioCafPatronatoListino } from "@/lib/gestiio-listini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const rules = await fetchGestiioCafPatronatoListino();
    return NextResponse.json({ rules, source: "gestiio" });
  } catch (error) {
    const status = (error as { status?: number })?.status || 502;
    return NextResponse.json(
      {
        rules: [],
        message:
          error instanceof Error ? error.message : "Listino CAF/Patronato non disponibile",
      },
      { status },
    );
  }
}

export async function GET() {
  return POST();
}
`,
);

fs.writeFileSync(
  "src/app/api/client-area/visure/pricing/route.ts",
  `import { NextResponse } from "next/server";
import { fetchGestiioVisureListino } from "@/lib/gestiio-listini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const rules = await fetchGestiioVisureListino();
    return NextResponse.json({ rules, source: "gestiio" });
  } catch (error) {
    const status = (error as { status?: number })?.status || 502;
    return NextResponse.json(
      {
        rules: [],
        message: error instanceof Error ? error.message : "Listino visure non disponibile",
      },
      { status },
    );
  }
}

export async function GET() {
  return POST();
}
`;
);

fs.writeFileSync(
  "src/app/api/public/visure-pricing/route.ts",
  `import { NextResponse } from "next/server";
import { fetchGestiioVisureListino } from "@/lib/gestiio-listini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rules = await fetchGestiioVisureListino();
    return NextResponse.json({
      rules: rules.filter((r) => r.active).map((r) => ({
        serviceType: r.serviceType,
        label: r.label,
        priceEUR: r.priceEUR,
      })),
      source: "gestiio",
    });
  } catch (error) {
    return NextResponse.json(
      {
        rules: [],
        message: error instanceof Error ? error.message : "Listino visure non disponibile",
      },
      { status: 502 },
    );
  }
}
`,
);

console.log("gestiio listini wired");
