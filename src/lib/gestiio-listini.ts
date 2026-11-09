import "server-only";

/**
 * Callers: /api/client-area/caf-patronato/pricing, /api/client-area/visure/pricing,
 * /api/public/visure-pricing, checkout resolve.
 * Upstream: Gestiio client-portal public listini (CAF+Patronato, Visure).
 * Schema: GestiioListinoRule { serviceType, label, priceEUR, active }.
 * User: procedi — prezzi da Gestiio, non MySQL.
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
  return (process.env.GESTIIO_CLIENT_PORTAL_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
}

function apiKey() {
  const key =
    process.env.GESTIIO_CLIENT_PORTAL_API_KEY?.trim() ||
    process.env.GESTIIO_SEND_API_KEY?.trim();
  if (!key) {
    throw Object.assign(new Error("GESTIIO_CLIENT_PORTAL_API_KEY non configurata"), {
      status: 503,
    });
  }
  return key;
}

async function gestiioGet<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
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
      (typeof json?.error === "object" &&
      json.error &&
      "message" in (json.error as object)
        ? String((json.error as { message?: string }).message || "")
        : "") ||
      (typeof json?.message === "string" ? json.message : "") ||
      `Gestiio listino error (${res.status})`;
    throw Object.assign(new Error(msg), {
      status: res.status >= 400 ? res.status : 502,
    });
  }
  return (json?.data ?? json) as T;
}

function mapRules(raw: unknown): GestiioListinoRule[] {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { rules?: unknown })?.rules)
      ? (raw as { rules: unknown[] }).rules
      : Array.isArray((raw as { items?: unknown })?.items)
        ? (raw as { items: unknown[] }).items
        : [];

  return rows
    .map((row, index) => {
      const r = row as Record<string, unknown>;
      const price = Number(
        r.prezzo_cliente ?? r.price_eur ?? r.priceEUR ?? r.price ?? r.amount_eur ?? 0,
      );
      const serviceType = String(
        r.service_type ?? r.serviceType ?? r.slug ?? r.code ?? "",
      ).trim();
      const label = String(r.label ?? r.name ?? r.title ?? serviceType).trim();
      if (!serviceType || !Number.isFinite(price) || price < 0) return null;
      return {
        id: Number(r.id ?? index + 1),
        serviceType,
        label: label || serviceType,
        priceEUR: price,
        sortOrder: Number(r.sort_order ?? r.sortOrder ?? index),
        active: r.active === undefined ? true : Boolean(r.active),
        ...(r.scope ? { scope: String(r.scope) } : {}),
      } as GestiioListinoRule;
    })
    .filter((x): x is GestiioListinoRule => x != null);
}

export async function fetchGestiioCafPatronatoListino() {
  const path =
    process.env.GESTIIO_CAF_LISTINO_PATH?.trim() || "/listini/caf-patronato";
  return mapRules(await gestiioGet<unknown>(path));
}

export async function fetchGestiioVisureListino() {
  const path = process.env.GESTIIO_VISURE_LISTINO_PATH?.trim() || "/listini/visure";
  return mapRules(await gestiioGet<unknown>(path));
}

export async function resolveGestiioListinoPrice(
  rules: GestiioListinoRule[],
  serviceType: string,
) {
  const hit = rules.find(
    (r) => r.active && r.serviceType === serviceType && Number.isFinite(r.priceEUR),
  );
  if (!hit) {
    throw Object.assign(new Error("Tariffa non trovata nel listino Gestiio"), {
      status: 404,
    });
  }
  return hit;
}
