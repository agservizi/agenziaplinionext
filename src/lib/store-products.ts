export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  amountCents: number;
  currency: string;
  checkoutUrl: string;
  payhipCheckoutUrl: string;
};

const fallbackProducts: StoreProduct[] = [];

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function toPriceLabel(product: Record<string, unknown>): string {
  const formatted =
    toStringValue(product.price_formatted) ||
    toStringValue(product.price_display) ||
    toStringValue(product.formatted_price);
  if (formatted) return formatted;

  const rawPrice = product.price;
  if (typeof rawPrice === "number" && Number.isFinite(rawPrice)) {
    return `€${rawPrice}`;
  }

  if (typeof rawPrice === "string" && rawPrice.trim()) {
    return rawPrice.trim();
  }

  return "Prezzo su richiesta";
}

function toAmountCents(product: Record<string, unknown>): number {
  const rawAmount =
    (typeof product.price === "number" ? product.price : Number(toStringValue(product.price))) ||
    (typeof product.amount === "number" ? product.amount : Number(toStringValue(product.amount))) ||
    0;

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) return 0;
  return Math.round(rawAmount * 100);
}

function toCurrency(product: Record<string, unknown>): string {
  return (toStringValue(product.currency) || "EUR").toLowerCase();
}

function isAllowedCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("payhip.com");
  } catch {
    return false;
  }
}

function normalizePayhipProduct(product: Record<string, unknown>, index: number): StoreProduct | null {
  const idSource =
    toStringValue(product.id) ||
    toStringValue(product.product_id) ||
    toStringValue(product.slug) ||
    toStringValue(product.title) ||
    `payhip-${index + 1}`;

  const id = idSource
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `payhip-${index + 1}`;

  const name =
    toStringValue(product.name) ||
    toStringValue(product.title) ||
    `Prodotto ${index + 1}`;

  const description =
    toStringValue(product.description) ||
    toStringValue(product.summary) ||
    "Prodotto disponibile all'acquisto online.";

  const checkoutUrlCandidate =
    toStringValue(product.checkout_url) ||
    toStringValue(product.product_url) ||
    toStringValue(product.url) ||
    toStringValue(product.link);

  if (!checkoutUrlCandidate || !isAllowedCheckoutUrl(checkoutUrlCandidate)) {
    return null;
  }

  return {
    id,
    name,
    description,
    priceLabel: toPriceLabel(product),
    amountCents: toAmountCents(product),
    currency: toCurrency(product),
    checkoutUrl: `/checkout?product=${encodeURIComponent(id)}`,
    payhipCheckoutUrl: checkoutUrlCandidate,
  };
}

function extractProducts(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  }

  if (!payload || typeof payload !== "object") return [];
  const source = payload as Record<string, unknown>;
  const candidates = [source.products, source.data, source.results, source.items];

  for (const entry of candidates) {
    if (Array.isArray(entry)) {
      return entry.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
    }
  }

  return [];
}

async function fetchPayhipProducts(): Promise<StoreProduct[]> {
  const apiKey = toStringValue(process.env.PAYHIP_API_KEY);
  if (!apiKey) return [];

  const apiUrl = toStringValue(process.env.PAYHIP_PRODUCTS_API_URL) || "https://payhip.com/api/products";
  const requests = [
    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${apiUrl.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(apiKey)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }),
  ];

  for (const request of requests) {
    try {
      const response = await request;
      if (!response.ok) continue;
      const payload = await response.json();
      const products = extractProducts(payload)
        .map((item, index) => normalizePayhipProduct(item, index))
        .filter((item): item is StoreProduct => Boolean(item));
      if (products.length > 0) return products;
    } catch {
      continue;
    }
  }

  return [];
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  const payhipProducts = await fetchPayhipProducts();
  if (payhipProducts.length > 0) return payhipProducts;
  return fallbackProducts;
}
