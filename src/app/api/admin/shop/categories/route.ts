import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { createCategory } from "@/lib/saleor/admin-ops";
import { fetchShopCategories } from "@/lib/saleor/client";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_read");
  if ("error" in auth) return auth.error;
  const result = await fetchShopCategories(50);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_write");
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as { name?: string; slug?: string };
  if (!body.name || !body.slug) {
    return NextResponse.json({ ok: false, error: "name and slug required" }, { status: 400 });
  }
  const result = await createCategory({ name: body.name.trim(), slug: body.slug.trim() });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
