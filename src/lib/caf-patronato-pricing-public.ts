import type { CafPatronatoPricingRule } from "@/lib/caf-patronato-pricing-engine";

export async function fetchPublicCafPatronatoPricing() {
  const response = await fetch("/api/client-area/caf-patronato/pricing", {
    method: "POST",
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    rules?: CafPatronatoPricingRule[];
  };

  if (!response.ok) {
    throw new Error("Caricamento prezzi CAF/Patronato non riuscito");
  }

  return payload.rules || [];
}
