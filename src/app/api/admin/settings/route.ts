import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "settings");
  if ("error" in auth) return auth.error;
  await ensureSaleorBridgeTables();
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT * FROM shop_settings WHERE id = 1 LIMIT 1`,
  );
  const row = rows[0] || {
    shop_enabled: 1,
    default_currency: "EUR",
    default_vat_rate: 22,
    feature_flags_json: null,
  };
  return NextResponse.json({ ok: true, settings: row });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "settings");
  if ("error" in auth) return auth.error;
  await ensureSaleorBridgeTables();
  const body = (await request.json()) as {
    shopEnabled?: boolean;
    defaultCurrency?: string;
    defaultVatRate?: number;
    featureFlags?: Record<string, unknown>;
    notifications?: {
      orderConfirm?: boolean;
      shipped?: boolean;
      digitalReady?: boolean;
      serviceUpdate?: boolean;
    };
  };

  const pool = getPool();
  await pool.execute(
    `INSERT INTO shop_settings (id, shop_enabled, default_currency, default_vat_rate, feature_flags_json)
     VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       shop_enabled = VALUES(shop_enabled),
       default_currency = VALUES(default_currency),
       default_vat_rate = VALUES(default_vat_rate),
       feature_flags_json = VALUES(feature_flags_json)`,
    [
      body.shopEnabled === false ? 0 : 1,
      (body.defaultCurrency || "EUR").toUpperCase().slice(0, 3),
      body.defaultVatRate ?? 22,
      JSON.stringify({
        ...(body.featureFlags || {}),
        notifications: body.notifications || {},
      }),
    ],
  );

  return NextResponse.json({ ok: true });
}
