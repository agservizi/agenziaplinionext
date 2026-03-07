"use client";

export type PublicShippingPricingRule = {
  id: number;
  label: string;
  minWeightKG: number;
  maxWeightKG: number;
  minVolumeM3: number;
  maxVolumeM3: number;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
};

const shippingPricingApiBase = (
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_API_BASE ||
  process.env.NEXT_PUBLIC_BOOKING_API_BASE ||
  ""
).replace(/\/$/, "");

function resolveShippingPricingApiBase() {
  if (typeof window === "undefined") {
    return shippingPricingApiBase;
  }

  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const pointsToProduction =
    shippingPricingApiBase === "https://agenziaplinio.it" ||
    shippingPricingApiBase === "https://www.agenziaplinio.it";

  if (isLocalhost && (!shippingPricingApiBase || pointsToProduction)) {
    return "http://localhost:3001";
  }

  return shippingPricingApiBase;
}

function buildApiUrl(path: string) {
  const apiBase = resolveShippingPricingApiBase();
  return apiBase ? `${apiBase}${path}` : path;
}

export async function fetchPublicShippingPricing() {
  const response = await fetch(buildApiUrl("/api/public/shipping-pricing"), {
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    rules?: PublicShippingPricingRule[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Caricamento listino spedizioni non riuscito");
  }

  return payload.rules || [];
}
