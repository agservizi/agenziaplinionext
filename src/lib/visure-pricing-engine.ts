import { getPool } from "@/lib/db";
import type { SupportedVisuraService } from "@/lib/openapi-visure";
import { resolveVisuraPrice as resolveFallbackVisuraPrice } from "@/lib/visure-pricing";

export async function ensureVisurePricingTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS visure_pricing_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_type VARCHAR(120) NOT NULL,
      label VARCHAR(191) NOT NULL,
      price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_visure_pricing_service (service_type),
      KEY idx_visure_pricing_sort (sort_order),
      KEY idx_visure_pricing_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function resolveDatabaseVisuraPrice(serviceType: SupportedVisuraService) {
  if (
    !process.env.MYSQL_HOST ||
    !process.env.MYSQL_USER ||
    !process.env.MYSQL_PASSWORD ||
    !process.env.MYSQL_DATABASE
  ) {
    return resolveFallbackVisuraPrice(serviceType);
  }

  try {
    await ensureVisurePricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT label, price_eur
       FROM visure_pricing_rules
       WHERE service_type = ? AND active = 1
       ORDER BY sort_order ASC, id ASC
       LIMIT 1`,
      [serviceType],
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0] as { label?: string; price_eur?: number };
      const priceEUR = Number(row.price_eur || 0);
      if (Number.isFinite(priceEUR) && priceEUR > 0) {
        return {
          amountCents: Math.round(priceEUR * 100),
          label: String(row.label || "").trim() || resolveFallbackVisuraPrice(serviceType).label,
        };
      }
    }
  } catch {
    return resolveFallbackVisuraPrice(serviceType);
  }

  return resolveFallbackVisuraPrice(serviceType);
}

export async function listDatabaseVisurePricingRules() {
  if (
    !process.env.MYSQL_HOST ||
    !process.env.MYSQL_USER ||
    !process.env.MYSQL_PASSWORD ||
    !process.env.MYSQL_DATABASE
  ) {
    return [];
  }

  try {
    await ensureVisurePricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, service_type, label, price_eur, sort_order, active
       FROM visure_pricing_rules
       WHERE active = 1
       ORDER BY sort_order ASC, id ASC`,
    );

    return Array.isArray(rows)
      ? rows.map((row: any) => ({
          id: Number(row.id || 0),
          serviceType: String(row.service_type || ""),
          label: String(row.label || ""),
          priceEUR: Number(row.price_eur || 0),
          sortOrder: Number(row.sort_order || 0),
          active: Boolean(row.active),
        }))
      : [];
  } catch {
    return [];
  }
}
