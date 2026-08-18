/** Server-only helpers for Gestiio Locker Point (fermo deposito) API. */

export const LOCKER_POINT_API_BASE = (
  process.env.GESTIIO_LOCKER_API_BASE ||
  "https://gestiio.agenziaplinio.it/api/public/locker-point"
).replace(/\/+$/, "");

export function getLockerPointApiKey(): string {
  return String(process.env.GESTIIO_LOCKER_API_KEY || "").trim();
}

export function lockerPointHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const key = getLockerPointApiKey();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extra,
  };
  if (key) {
    headers["X-Api-Key"] = key;
  }
  return headers;
}

export function missingApiKeyResponse() {
  return {
    success: false as const,
    error: {
      code: "CONFIG_ERROR",
      message:
        "Servizio fermo deposito non configurato. Contatta l'agenzia per prenotare.",
    },
  };
}

/** Public fallback when Gestiio is unreachable or misconfigured. */
export const LOCKER_POINT_FALLBACK_PRICING = {
  dailyRate: 0.5,
  currency: "EUR",
  onlineIntakeEnabled: true,
  bookingInstructions:
    "Prenota online o passa in agenzia in Via Plinio il Vecchio 72.",
  pricingNote: "Tariffa indicativa da 0,50 € al giorno.",
} as const;

export function lockerPointFallbackPricingResponse() {
  return {
    success: true as const,
    data: LOCKER_POINT_FALLBACK_PRICING,
    fallback: true as const,
  };
}
