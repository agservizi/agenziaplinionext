import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { listStocks, stockUpdate } from "@/lib/saleor/admin-ops";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_read");
  if ("error" in auth) return auth.error;
  const result = await listStocks(50);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_write");
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as {
    variantId?: string;
    quantity?: number;
    warehouseId?: string;
  };
  if (!body.variantId || body.quantity == null) {
    return NextResponse.json({ ok: false, error: "variantId and quantity required" }, { status: 400 });
  }
  const result = await stockUpdate(body.variantId, Number(body.quantity), body.warehouseId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
