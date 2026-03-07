import type { SupportedVisuraService } from "@/lib/openapi-visure";

type VisuraPrice = {
  amountCents: number;
  label: string;
};

const DEFAULT_VISURE_PRICING: Record<SupportedVisuraService, VisuraPrice> = {
  "visura-camerale": { amountCents: 890, label: "Visura camerale base" },
  "visura-catastale": { amountCents: 1090, label: "Visura catastale base" },
  "visura-pra": { amountCents: 1290, label: "Visura PRA base" },
  "visura-crif": { amountCents: 1990, label: "Visura CRIF base" },
  "visura-cr": { amountCents: 2190, label: "Visura Centrale Rischi base" },
};

const ENV_KEYS: Record<SupportedVisuraService, string> = {
  "visura-camerale": "VISURA_PRICE_VISURA_CAMERALE",
  "visura-catastale": "VISURA_PRICE_VISURA_CATASTALE",
  "visura-pra": "VISURA_PRICE_VISURA_PRA",
  "visura-crif": "VISURA_PRICE_VISURA_CRIF",
  "visura-cr": "VISURA_PRICE_VISURA_CR",
};

export function resolveVisuraPrice(serviceType: SupportedVisuraService): VisuraPrice {
  const fallback = DEFAULT_VISURE_PRICING[serviceType];
  const raw = String(process.env[ENV_KEYS[serviceType]] || "").trim();
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed > 0) {
    return {
      amountCents: Math.round(parsed * 100),
      label: fallback.label,
    };
  }

  return fallback;
}

