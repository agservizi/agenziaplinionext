/**
 * Callers: src/app/api/deposito-bagagli/* routes.
 * Upstream: Gestiio /api/public/deposito-bagagli (ex coresuite 404).
 * User: controlliamo servizi connessi / JSON serializable (+ deposito 502).
 */
export const DEPOSITO_API_BASE = (
  process.env.GESTIIO_DEPOSITO_API_BASE ||
  process.env.DEPOSITO_BAGAGLI_API_BASE ||
  "https://gestiio.agenziaplinio.it/api/public/deposito-bagagli"
).replace(/\/+$/, "");

export function depositoApiKey() {
  return (
    process.env.GESTIIO_DEPOSITO_API_KEY?.trim() ||
    process.env.GESTIIO_LUGGAGE_API_KEY?.trim() ||
    process.env.LUGGAGE_API_KEY?.trim() ||
    process.env.DEPOSITO_BAGAGLI_API_KEY?.trim() ||
    process.env.CORESUITE_API_KEY?.trim() ||
    ""
  );
}

export function depositoApiHeaders(extra: HeadersInit = {}): HeadersInit {
  const key = depositoApiKey();
  return {
    Accept: "application/json",
    ...(key ? { "x-api-key": key } : {}),
    ...extra,
  };
}

export function depositoMissingKeyResponse() {
  return {
    success: false as const,
    error: {
      code: "CONFIG_ERROR",
      message: "Servizio deposito bagagli non configurato (API key mancante).",
    },
  };
}

export function requireDepositoApiKey() {
  const key = depositoApiKey();
  if (!key) {
    const err = new Error("GESTIIO_DEPOSITO_API_KEY mancante") as Error & { status?: number };
    err.status = 503;
    throw err;
  }
  return key;
}
