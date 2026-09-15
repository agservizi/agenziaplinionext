/**
 * Saleor GraphQL client (server-only).
 * App token must NEVER be exposed to the browser.
 */

const SALEOR_API_URL = (
  process.env.SALEOR_API_URL ||
  process.env.NEXT_PUBLIC_SALEOR_API_URL ||
  ""
).replace(/\/$/, "");

const SALEOR_CHANNEL = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || "default-channel";

export type SaleorMoney = {
  currency: string;
  amount: number;
};

export type SaleorProductCard = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  price: SaleorMoney | null;
  productType: string | null;
};

type GraphQlError = { message: string };

async function saleorFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: { useAppToken?: boolean },
): Promise<{ data?: T; errors?: GraphQlError[] }> {
  if (!SALEOR_API_URL) {
    return { errors: [{ message: "SALEOR_API_URL not configured" }] };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts?.useAppToken) {
    const token = process.env.SALEOR_APP_TOKEN;
    if (!token) {
      return { errors: [{ message: "SALEOR_APP_TOKEN missing" }] };
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(SALEOR_API_URL.endsWith("/graphql") || SALEOR_API_URL.endsWith("/graphql/")
      ? SALEOR_API_URL
      : `${SALEOR_API_URL}/graphql/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { errors: [{ message: `Saleor HTTP ${res.status}` }] };
    }
    return (await res.json()) as { data?: T; errors?: GraphQlError[] };
  } catch (error) {
    return {
      errors: [{ message: error instanceof Error ? error.message : "Saleor unreachable" }],
    };
  }
}

const PRODUCTS_QUERY = `
  query HomeProducts($first: Int!, $channel: String!) {
    products(first: $first, channel: $channel) {
      totalCount
      edges {
        node {
          id
          name
          slug
          thumbnail(size: 512) { url }
          productType { name }
          pricing {
            priceRange {
              start {
                gross { currency amount }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchPublishedProducts(first = 8): Promise<{
  products: SaleorProductCard[];
  totalCount: number;
  ok: boolean;
}> {
  const result = await saleorFetch<{
    products: {
      totalCount: number | null;
      edges: Array<{
        node: {
          id: string;
          name: string;
          slug: string;
          thumbnail?: { url?: string | null } | null;
          productType?: { name?: string | null } | null;
          pricing?: {
            priceRange?: {
              start?: { gross?: { currency: string; amount: number } | null } | null;
            } | null;
          } | null;
        };
      }>;
    };
  }>(PRODUCTS_QUERY, { first, channel: SALEOR_CHANNEL });

  if (result.errors?.length || !result.data?.products) {
    return { products: [], totalCount: 0, ok: false };
  }

  const products = result.data.products.edges.map(({ node }) => {
    const gross = node.pricing?.priceRange?.start?.gross;
    return {
      id: node.id,
      name: node.name,
      slug: node.slug,
      thumbnailUrl: node.thumbnail?.url || null,
      productType: node.productType?.name || null,
      price: gross
        ? { currency: gross.currency, amount: gross.amount }
        : null,
    } satisfies SaleorProductCard;
  });

  return {
    products,
    totalCount: result.data.products.totalCount ?? products.length,
    ok: true,
  };
}

export async function fetchAdminProducts(first = 50) {
  return saleorFetch(
    PRODUCTS_QUERY,
    { first, channel: SALEOR_CHANNEL },
    { useAppToken: true },
  );
}

const CATEGORIES_QUERY = `
  query ShopCategories($first: Int!, $channel: String!) {
    categories(first: $first, level: 0) {
      totalCount
      edges {
        node {
          id
          name
          slug
          products(first: 1, channel: $channel) { totalCount }
        }
      }
    }
  }
`;

export async function fetchShopCategories(first = 50) {
  const result = await saleorFetch<{
    categories: {
      totalCount: number | null;
      edges: Array<{
        node: {
          id: string;
          name: string;
          slug: string;
          products?: { totalCount?: number | null } | null;
        };
      }>;
    };
  }>(CATEGORIES_QUERY, { first, channel: SALEOR_CHANNEL }, { useAppToken: Boolean(process.env.SALEOR_APP_TOKEN) });

  if (result.errors?.length || !result.data?.categories) {
    return { ok: false as const, categories: [], totalCount: 0 };
  }

  return {
    ok: true as const,
    totalCount: result.data.categories.totalCount ?? 0,
    categories: result.data.categories.edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      productCount: node.products?.totalCount ?? 0,
    })),
  };
}

const ORDERS_QUERY = `
  query ShopOrders($first: Int!) {
    orders(first: $first, sortBy: { field: CREATED_AT, direction: DESC }) {
      totalCount
      edges {
        node {
          id
          number
          created
          status
          userEmail
          total { gross { amount currency } }
        }
      }
    }
  }
`;

export type SaleorOrderRow = {
  id: string;
  number: string | null;
  created: string | null;
  status: string | null;
  userEmail: string | null;
  total: SaleorMoney | null;
};

export async function fetchShopOrders(first = 50): Promise<{
  ok: boolean;
  orders: SaleorOrderRow[];
  totalCount: number;
  error?: string;
}> {
  const result = await saleorFetch<{
    orders: {
      totalCount: number | null;
      edges: Array<{
        node: {
          id: string;
          number?: string | null;
          created?: string | null;
          status?: string | null;
          userEmail?: string | null;
          total?: { gross?: { amount: number; currency: string } | null } | null;
        };
      }>;
    };
  }>(ORDERS_QUERY, { first }, { useAppToken: true });

  if (result.errors?.length || !result.data?.orders) {
    return {
      ok: false,
      orders: [],
      totalCount: 0,
      error: result.errors?.[0]?.message || "orders unavailable",
    };
  }

  return {
    ok: true,
    totalCount: result.data.orders.totalCount ?? 0,
    orders: result.data.orders.edges.map(({ node }) => ({
      id: node.id,
      number: node.number || null,
      created: node.created || null,
      status: node.status || null,
      userEmail: node.userEmail || null,
      total: node.total?.gross
        ? { amount: node.total.gross.amount, currency: node.total.gross.currency }
        : null,
    })),
  };
}

export function getSaleorChannel() {
  return SALEOR_CHANNEL;
}

export function isSaleorConfigured() {
  return Boolean(SALEOR_API_URL);
}
