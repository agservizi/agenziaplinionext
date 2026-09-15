import { NextResponse } from "next/server";
import { fetchPublishedProducts } from "@/lib/saleor/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = Math.min(24, Math.max(1, Number(searchParams.get("first") || 8)));
  const result = await fetchPublishedProducts(first);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, products: [], totalCount: 0 },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    products: result.products,
    totalCount: result.totalCount,
  });
}
