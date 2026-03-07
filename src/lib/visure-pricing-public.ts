export type PublicVisurePricingRule = {
  id: number;
  serviceType: string;
  label: string;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
};

const visurePricingApiBase = (
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_API_BASE ||
  process.env.NEXT_PUBLIC_BOOKING_API_BASE ||
  ""
).replace(/\/$/, "");

function resolveVisurePricingApiBase() {
  if (typeof window === "undefined") {
    return visurePricingApiBase;
  }

  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const pointsToProduction =
    visurePricingApiBase === "https://agenziaplinio.it" ||
    visurePricingApiBase === "https://www.agenziaplinio.it";

  if (isLocalhost && (!visurePricingApiBase || pointsToProduction)) {
    return "http://localhost:3001";
  }

  return visurePricingApiBase;
}

function buildApiUrl(path: string) {
  const apiBase = resolveVisurePricingApiBase();
  return apiBase ? `${apiBase}${path}` : path;
}

export async function fetchPublicVisurePricing() {
  const response = await fetch(buildApiUrl("/api/public/visure-pricing"), {
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    rules?: PublicVisurePricingRule[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Caricamento listino visure non riuscito");
  }

  return payload.rules || [];
}
