import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/api-guard";
import {
  archiveProduct,
  createProduct,
  listProductTypes,
  publishProduct,
} from "@/lib/saleor/admin-ops";
import { fetchPublishedProducts, fetchAdminProducts, isSaleorConfigured } from "@/lib/saleor/client";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_read");
  if ("error" in auth) return auth.error;

  if (!isSaleorConfigured()) {
    return NextResponse.json({ ok: false, products: [], error: "Saleor not configured" }, { status: 503 });
  }

  if (process.env.SALEOR_APP_TOKEN) {
    const result = await fetchAdminProducts(50);
    if (result.errors?.length) {
      return NextResponse.json({ ok: false, errors: result.errors }, { status: 502 });
    }
    return NextResponse.json({ ok: true, data: result.data, mode: "app-token" });
  }

  const result = await fetchPublishedProducts(50);
  return NextResponse.json({
    ok: result.ok,
    products: result.products,
    totalCount: result.totalCount,
    mode: "public-fallback",
  });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_write");
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    action?: string;
    name?: string;
    slug?: string;
    productTypeId?: string;
    categoryId?: string;
    description?: string;
    productId?: string;
    publish?: boolean;
  };

  const action = body.action || "create";

  if (action === "types") {
    const types = await listProductTypes();
    return NextResponse.json(types);
  }

  if (action === "publish" && body.productId) {
    const result = await publishProduct(body.productId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "archive" && body.productId) {
    const result = await archiveProduct(body.productId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (!body.name || !body.slug) {
    return NextResponse.json({ ok: false, error: "name and slug required" }, { status: 400 });
  }

  let productTypeId = body.productTypeId;
  if (!productTypeId) {
    const types = await listProductTypes();
    productTypeId = types.items[0]?.id;
  }
  if (!productTypeId) {
    return NextResponse.json(
      { ok: false, error: "Nessun product type in Saleor. Creane uno dalla Dashboard." },
      { status: 400 },
    );
  }

  const created = await createProduct({
    name: body.name.trim(),
    slug: body.slug.trim(),
    productTypeId,
    categoryId: body.categoryId,
    description: body.description,
  });
  if (!created.ok) {
    return NextResponse.json(created, { status: 400 });
  }

  if (body.publish !== false) {
    await publishProduct(created.product.id);
  }

  return NextResponse.json(created);
}
