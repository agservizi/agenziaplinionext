/**
 * Callers: DepositoBookingClient, PrenotaFlowClient, RisultatiClient, LuggageBookingWidget.
 * Schema: normalized dailyRate / capacity / operatingHours from Gestiio pricing payloads.
 * User: procedi — harden deposito clients.
 */

export type DepositoOperatingHours = {
  open: string;
  close: string;
} | null;

export type NormalizedDepositoPricing = {
  dailyRate: number;
  currency: string;
  maxDailyCapacity: number | null;
  operatingHours: DepositoOperatingHours;
  raw: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function unwrapDepositoPayload(json: unknown): Record<string, unknown> {
  const root = asRecord(json);
  const data = asRecord(root.data);
  return Object.keys(data).length ? data : root;
}

export function normalizeDepositoOperatingHours(value: unknown): DepositoOperatingHours {
  const hours = asRecord(value);
  const open = String(hours.open ?? hours.open_time ?? "").trim();
  const close = String(hours.close ?? hours.close_time ?? "").trim();
  if (!open || !close) return null;
  return { open, close };
}

export function normalizeDepositoPricing(json: unknown): NormalizedDepositoPricing {
  const payload = unwrapDepositoPayload(json);
  const pricing = asRecord(payload.pricing);
  const source = Object.keys(pricing).length ? pricing : payload;
  const dailyRate = Number(
    source.dailyRate ?? source.daily_rate ?? payload.dailyRate ?? payload.daily_rate ?? 0,
  );
  const maxDailyCapacityRaw =
    source.maxDailyCapacity ??
    source.max_daily_capacity ??
    payload.maxDailyCapacity ??
    payload.max_daily_capacity;
  const maxDailyCapacity =
    maxDailyCapacityRaw === undefined || maxDailyCapacityRaw === null
      ? null
      : Number(maxDailyCapacityRaw);

  return {
    dailyRate: Number.isFinite(dailyRate) ? dailyRate : 0,
    currency: String(source.currency ?? payload.currency ?? "EUR"),
    maxDailyCapacity: Number.isFinite(maxDailyCapacity as number)
      ? (maxDailyCapacity as number)
      : null,
    operatingHours: normalizeDepositoOperatingHours(
      source.operatingHours ??
        source.operating_hours ??
        payload.operatingHours ??
        payload.operating_hours,
    ),
    raw: payload,
  };
}
