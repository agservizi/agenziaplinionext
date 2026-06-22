import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensureShippingPricingTable } from "@/lib/shipping-pricing-engine";

export const runtime = "nodejs";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        ok: true,
        rules: [],
        warning: "Database listino spedizioni non configurato.",
      },
      { status: 200 },
    );
  }

  try {
    await ensureShippingPricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         id,
         label,
         carrier_provider,
         package_size,
         service_scope,
         country_code,
         min_weight_kg,
         max_weight_kg,
         min_volume_m3,
         max_volume_m3,
         price_eur,
         sort_order,
         active
       FROM shipping_pricing_rules
       WHERE active = 1
       ORDER BY carrier_provider ASC, package_size ASC, service_scope ASC, country_code ASC, sort_order ASC, id ASC`,
    );

    const normalizedRows = Array.isArray(rows) ? (rows as Array<Record<string, unknown>>) : [];
    const rules = normalizedRows.map((row) => ({
      id: Number(row.id || 0),
      label: String(row.label || ""),
      carrierProvider:
        String(row.carrier_provider || "brt").trim().toLowerCase() === "inpost" ? "inpost" : "brt",
      packageSize: ["small", "medium", "large"].includes(
        String(row.package_size || "").trim().toLowerCase(),
      )
        ? String(row.package_size || "").trim().toLowerCase()
        : "",
      serviceScope: ["national", "international", "all"].includes(
        String(row.service_scope || "").trim().toLowerCase(),
      )
        ? String(row.service_scope || "").trim().toLowerCase()
        : "all",
      countryCode: String(row.country_code || "").trim().toUpperCase(),
      minWeightKG: Number(row.min_weight_kg || 0),
      maxWeightKG: Number(row.max_weight_kg || 0),
      minVolumeM3: Number(row.min_volume_m3 || 0),
      maxVolumeM3: Number(row.max_volume_m3 || 0),
      priceEUR: Number(row.price_eur || 0),
      sortOrder: Number(row.sort_order || 0),
      active: Boolean(row.active),
    }));

    return NextResponse.json({ ok: true, rules }, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: true,
        rules: [],
        warning:
          error instanceof Error
            ? error.message
            : "Listino spedizioni non disponibile al momento.",
      },
      { status: 200 },
    );
  }
}
