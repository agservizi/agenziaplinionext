/**
 * Saleor admin operations (mutations) — server-only App Token.
 */

const SALEOR_API_URL = (
  process.env.SALEOR_API_URL ||
  process.env.NEXT_PUBLIC_SALEOR_API_URL ||
  ""
).replace(/\/$/, "");

const SALEOR_CHANNEL = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || "default-channel";

type GqlError = { message: string };

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: T; errors?: GqlError[] }> {
  if (!SALEOR_API_URL) return { errors: [{ message: "SALEOR_API_URL not configured" }] };
  const token = process.env.SALEOR_APP_TOKEN;
  if (!token) return { errors: [{ message: "SALEOR_APP_TOKEN missing" }] };

  const endpoint =
    SALEOR_API_URL.endsWith("/graphql") || SALEOR_API_URL.endsWith("/graphql/")
      ? SALEOR_API_URL
      : `${SALEOR_API_URL}/graphql/`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    if (!res.ok) return { errors: [{ message: `Saleor HTTP ${res.status}` }] };
    return (await res.json()) as { data?: T; errors?: GqlError[] };
  } catch (error) {
    return { errors: [{ message: error instanceof Error ? error.message : "unreachable" }] };
  }
}

function firstError(errors?: GqlError[], path?: Array<{ message?: string } | null>) {
  return (
    path?.find((e) => e?.message)?.message ||
    errors?.[0]?.message ||
    "Saleor operation failed"
  );
}

export async function listProductTypes() {
  const result = await gql<{
    productTypes: {
      edges: Array<{ node: { id: string; name: string; isShippingRequired: boolean } }>;
    };
  }>(`query { productTypes(first: 50) { edges { node { id name isShippingRequired } } } }`);
  if (result.errors || !result.data) return { ok: false as const, items: [], error: firstError(result.errors) };
  return {
    ok: true as const,
    items: result.data.productTypes.edges.map((e) => e.node),
  };
}

export async function createProduct(input: {
  name: string;
  slug: string;
  productTypeId: string;
  categoryId?: string;
  description?: string;
}) {
  const result = await gql<{
    productCreate: {
      product?: { id: string; name: string; slug: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation CreateProduct($input: ProductCreateInput!) {
      productCreate(input: $input) {
        product { id name slug }
        errors { message field }
      }
    }`,
    {
      input: {
        name: input.name,
        slug: input.slug,
        productType: input.productTypeId,
        category: input.categoryId || undefined,
        description: input.description
          ? JSON.stringify({
              time: Date.now(),
              blocks: [{ type: "paragraph", data: { text: input.description } }],
            })
          : undefined,
      },
    },
  );

  const payload = result.data?.productCreate;
  if (!payload?.product) {
    return { ok: false as const, error: firstError(result.errors, payload?.errors) };
  }
  return { ok: true as const, product: payload.product };
}

export async function publishProduct(productId: string) {
  const ch = await gql<{ channels: Array<{ id: string; slug: string }> }>(
    `query { channels { id slug } }`,
  );
  const channelId =
    ch.data?.channels?.find((c) => c.slug === SALEOR_CHANNEL)?.id ||
    ch.data?.channels?.[0]?.id;
  if (!channelId) {
    return { ok: false as const, error: firstError(ch.errors) || "No Saleor channel found" };
  }

  const result = await gql<{
    productChannelListingUpdate: {
      product?: { id: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation Publish($id: ID!, $input: ProductChannelListingUpdateInput!) {
      productChannelListingUpdate(id: $id, input: $input) {
        product { id }
        errors { message }
      }
    }`,
    {
      id: productId,
      input: {
        updateChannels: [
          {
            channelId,
            isPublished: true,
            visibleInListings: true,
            isAvailableForPurchase: true,
          },
        ],
      },
    },
  );

  if (!result.data?.productChannelListingUpdate?.product) {
    return {
      ok: false as const,
      error: firstError(result.errors, result.data?.productChannelListingUpdate?.errors),
    };
  }
  return { ok: true as const, productId };
}

export async function archiveProduct(productId: string) {
  const result = await gql<{
    productDelete: {
      product?: { id: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation Del($id: ID!) {
      productDelete(id: $id) {
        product { id }
        errors { message }
      }
    }`,
    { id: productId },
  );
  if (!result.data?.productDelete?.product) {
    return {
      ok: false as const,
      error: firstError(result.errors, result.data?.productDelete?.errors),
    };
  }
  return { ok: true as const };
}

export async function createCategory(input: { name: string; slug: string }) {
  const result = await gql<{
    categoryCreate: {
      category?: { id: string; name: string; slug: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation Cat($input: CategoryInput!) {
      categoryCreate(input: $input) {
        category { id name slug }
        errors { message }
      }
    }`,
    { input: { name: input.name, slug: input.slug } },
  );
  if (!result.data?.categoryCreate?.category) {
    return {
      ok: false as const,
      error: firstError(result.errors, result.data?.categoryCreate?.errors),
    };
  }
  return { ok: true as const, category: result.data.categoryCreate.category };
}

export async function createVoucher(input: {
  code: string;
  discountValue: number;
  type: "PERCENTAGE" | "FIXED";
  minSpent?: number;
}) {
  const result = await gql<{
    voucherCreate: {
      voucher?: { id: string; code: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation V($input: VoucherInput!) {
      voucherCreate(input: $input) {
        voucher { id code }
        errors { message }
      }
    }`,
    {
      input: {
        code: input.code,
        type: input.type,
        discountValue: input.discountValue,
        minSpent:
          input.minSpent != null
            ? { amount: input.minSpent, currency: "EUR" }
            : undefined,
      },
    },
  );
  if (!result.data?.voucherCreate?.voucher) {
    return {
      ok: false as const,
      error: firstError(result.errors, result.data?.voucherCreate?.errors),
    };
  }
  return { ok: true as const, voucher: result.data.voucherCreate.voucher };
}

export async function listVouchers(first = 50) {
  const result = await gql<{
    vouchers: {
      edges: Array<{
        node: {
          id: string;
          code: string | null;
          type: string;
          discountValue: number;
        };
      }>;
    };
  }>(
    `query($first: Int!) {
      vouchers(first: $first) {
        edges { node { id code type discountValue } }
      }
    }`,
    { first },
  );
  if (result.errors || !result.data) {
    return { ok: false as const, items: [], error: firstError(result.errors) };
  }
  return {
    ok: true as const,
    items: result.data.vouchers.edges.map((e) => e.node),
  };
}

export async function fetchOrderById(orderId: string) {
  const result = await gql<{
    order: {
      id: string;
      number: string;
      status: string;
      userEmail: string | null;
      created: string;
      total: { gross: { amount: number; currency: string } };
      lines: Array<{
        id: string;
        productName: string;
        quantity: number;
        variant?: { id: string; sku?: string | null } | null;
        totalPrice: { gross: { amount: number; currency: string } };
      }>;
      fulfillments: Array<{
        id: string;
        status: string;
        trackingNumber: string | null;
      }>;
    } | null;
  }>(
    `query($id: ID!) {
      order(id: $id) {
        id number status userEmail created
        total { gross { amount currency } }
        lines {
          id productName quantity
          variant { id sku }
          totalPrice { gross { amount currency } }
        }
        fulfillments { id status trackingNumber }
      }
    }`,
    { id: orderId },
  );
  if (result.errors || !result.data?.order) {
    return { ok: false as const, error: firstError(result.errors), order: null };
  }
  return { ok: true as const, order: result.data.order };
}

export async function cancelOrder(orderId: string) {
  const result = await gql<{
    orderCancel: {
      order?: { id: string; status: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation($id: ID!) {
      orderCancel(id: $id) {
        order { id status }
        errors { message }
      }
    }`,
    { id: orderId },
  );
  if (!result.data?.orderCancel?.order) {
    return {
      ok: false as const,
      error: firstError(result.errors, result.data?.orderCancel?.errors),
    };
  }
  return { ok: true as const, order: result.data.orderCancel.order };
}

export async function refundOrder(orderId: string, amount?: number) {
  // Prefer transactionRequestAction / orderRefund depending on Saleor version.
  const result = await gql<{
    orderRefund: {
      order?: { id: string; status: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation($id: ID!, $amount: PositiveDecimal) {
      orderRefund(id: $id, amount: $amount) {
        order { id status }
        errors { message }
      }
    }`,
    { id: orderId, amount: amount ?? null },
  );
  if (!result.data?.orderRefund?.order) {
    return {
      ok: false as const,
      error: firstError(result.errors, result.data?.orderRefund?.errors),
    };
  }
  return { ok: true as const, order: result.data.orderRefund.order };
}

export async function stockUpdate(variantId: string, quantity: number, warehouseId?: string) {
  let whId = warehouseId;
  if (!whId) {
    const wh = await gql<{ warehouses: { edges: Array<{ node: { id: string } }> } }>(
      `query { warehouses(first: 1) { edges { node { id } } } }`,
    );
    whId = wh.data?.warehouses?.edges?.[0]?.node?.id;
  }
  if (!whId) return { ok: false as const, error: "No warehouse configured in Saleor" };

  const result = await gql<{
    productVariantStocksUpdate: {
      productVariant?: { id: string } | null;
      errors: Array<{ message?: string } | null>;
    };
  }>(
    `mutation($variantId: ID!, $stocks: [StockInput!]!) {
      productVariantStocksUpdate(variantId: $variantId, stocks: $stocks) {
        productVariant { id }
        errors { message }
      }
    }`,
    {
      variantId,
      stocks: [{ warehouse: whId, quantity }],
    },
  );
  if (!result.data?.productVariantStocksUpdate?.productVariant) {
    return {
      ok: false as const,
      error: firstError(
        result.errors,
        result.data?.productVariantStocksUpdate?.errors,
      ),
    };
  }
  return { ok: true as const };
}

export async function listStocks(first = 50) {
  const result = await gql<{
    productVariants: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          sku: string | null;
          stocks: Array<{ quantity: number; warehouse: { name: string } }>;
          product: { name: string };
        };
      }>;
    };
  }>(
    `query($first: Int!) {
      productVariants(first: $first) {
        edges {
          node {
            id name sku
            stocks { quantity warehouse { name } }
            product { name }
          }
        }
      }
    }`,
    { first },
  );
  if (result.errors || !result.data) {
    return { ok: false as const, items: [], error: firstError(result.errors) };
  }
  return {
    ok: true as const,
    items: result.data.productVariants.edges.map((e) => e.node),
  };
}

export { SALEOR_CHANNEL };
