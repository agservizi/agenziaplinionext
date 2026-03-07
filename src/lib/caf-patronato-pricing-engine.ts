import { getPool } from "@/lib/db";
import { getCafPatronatoServicePrice } from "@/lib/caf-patronato-catalog";

export type CafPatronatoPricingRule = {
  id: number;
  serviceType: string;
  label: string;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
};

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export async function ensureCafPatronatoPricingRulesTable() {
  if (!hasDatabaseConfig()) {
    throw new Error("Database non configurato");
  }

  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS caf_patronato_pricing_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_type VARCHAR(120) NOT NULL,
      label VARCHAR(191) NOT NULL,
      price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_caf_patronato_pricing_service (service_type),
      KEY idx_caf_patronato_pricing_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function listDatabaseCafPatronatoPricingRules() {
  await ensureCafPatronatoPricingRulesTable();
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, service_type, label, price_eur, sort_order, active
     FROM caf_patronato_pricing_rules
     ORDER BY service_type ASC, sort_order ASC, id ASC`,
  );

  return Array.isArray(rows)
    ? (rows as any[]).map((row) => ({
        id: Number(row.id || 0),
        serviceType: String(row.service_type || ""),
        label: String(row.label || ""),
        priceEUR: Number(row.price_eur || 0),
        sortOrder: Number(row.sort_order || 0),
        active: Boolean(row.active),
      }))
    : [];
}

export async function upsertDatabaseCafPatronatoPricingRule(
  rule: Omit<CafPatronatoPricingRule, "id"> & { id?: number },
) {
  await ensureCafPatronatoPricingRulesTable();
  const pool = getPool();

  if (rule.id) {
    await pool.execute(
      `UPDATE caf_patronato_pricing_rules
       SET service_type = ?, label = ?, price_eur = ?, sort_order = ?, active = ?
       WHERE id = ?`,
      [
        rule.serviceType,
        rule.label,
        Number(rule.priceEUR || 0),
        Number(rule.sortOrder || 0),
        rule.active ? 1 : 0,
        rule.id,
      ],
    );
    return rule.id;
  }

  const [result] = await pool.execute(
    `INSERT INTO caf_patronato_pricing_rules
      (service_type, label, price_eur, sort_order, active)
     VALUES (?, ?, ?, ?, ?)`,
    [
      rule.serviceType,
      rule.label,
      Number(rule.priceEUR || 0),
      Number(rule.sortOrder || 0),
      rule.active ? 1 : 0,
    ],
  );

  return Number((result as { insertId?: number }).insertId || 0);
}

export async function deleteDatabaseCafPatronatoPricingRule(id: number) {
  await ensureCafPatronatoPricingRulesTable();
  const pool = getPool();
  await pool.execute("DELETE FROM caf_patronato_pricing_rules WHERE id = ?", [id]);
}

export async function resolveDatabaseCafPatronatoPrice(serviceType: string) {
  const fallback = getCafPatronatoServicePrice(serviceType);
  const fallbackResult = fallback
    ? {
        source: "catalog" as const,
        amountCents: fallback.amountCents,
        label: fallback.label,
        service: fallback.service,
        rule: null,
      }
    : null;

  if (!hasDatabaseConfig()) {
    return fallbackResult;
  }

  await ensureCafPatronatoPricingRulesTable();
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, service_type, label, price_eur, sort_order, active
     FROM caf_patronato_pricing_rules
     WHERE service_type = ? AND active = 1
     ORDER BY sort_order ASC, id ASC
     LIMIT 1`,
    [serviceType],
  );

  const row = Array.isArray(rows) ? (rows as any[])[0] : null;
  if (!row || !fallback) {
    return fallbackResult;
  }

  const priceEUR = Number(row.price_eur || 0);
  return {
    source: "rule" as const,
    amountCents: Math.round(priceEUR * 100),
    label: String(row.label || fallback.label),
    service: fallback.service,
    rule: {
      id: Number(row.id || 0),
      serviceType: String(row.service_type || serviceType),
      label: String(row.label || fallback.label),
      priceEUR,
      sortOrder: Number(row.sort_order || 0),
      active: Boolean(row.active),
    } satisfies CafPatronatoPricingRule,
  };
}
