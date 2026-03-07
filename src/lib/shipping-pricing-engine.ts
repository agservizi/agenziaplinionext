import { getPool } from "@/lib/db";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export async function ensureShippingPricingTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS shipping_pricing_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(191) NOT NULL,
      service_scope VARCHAR(20) NOT NULL DEFAULT 'all',
      country_code VARCHAR(8) NOT NULL DEFAULT '',
      min_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
      max_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
      min_volume_m3 DECIMAL(10,4) NOT NULL DEFAULT 0,
      max_volume_m3 DECIMAL(10,4) NOT NULL DEFAULT 0,
      price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Backward-compatible migration for existing installations.
  try {
    await pool.execute(
      "ALTER TABLE shipping_pricing_rules ADD COLUMN service_scope VARCHAR(20) NOT NULL DEFAULT 'all' AFTER label",
    );
  } catch {}
  try {
    await pool.execute(
      "ALTER TABLE shipping_pricing_rules ADD COLUMN country_code VARCHAR(8) NOT NULL DEFAULT '' AFTER service_scope",
    );
  } catch {}
}

export async function resolveShippingPrice(
  taxableWeightKG: number,
  volumeM3: number,
  destinationCountry: string,
  options?: { strict?: boolean },
) {
  let label = "Tariffa base";
  let amountEUR = 0;
  const country = String(destinationCountry || "IT").toUpperCase();
  const serviceScope = country === "IT" ? "national" : "international";

  if (hasDatabaseConfig()) {
    await ensureShippingPricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         label,
         service_scope,
         country_code,
         min_weight_kg,
         max_weight_kg,
         min_volume_m3,
         max_volume_m3,
         price_eur,
         sort_order
       FROM shipping_pricing_rules
       WHERE active = 1
       ORDER BY sort_order ASC, min_weight_kg ASC`,
    );

    const normalizedRows = Array.isArray(rows) ? (rows as any[]) : [];
    const includeLegacyAll = !options?.strict;
    const scopedRows = normalizedRows.filter((row) => {
      const rowScope = String(row.service_scope || "all").trim().toLowerCase();
      return rowScope === serviceScope || (includeLegacyAll && rowScope === "all");
    });
    const countryRows =
      serviceScope === "international"
        ? scopedRows.filter((row) => {
            const rowCountry = String(row.country_code || "").trim().toUpperCase();
            return rowCountry === country;
          })
        : scopedRows;
    const wildcardRows =
      serviceScope === "international"
        ? scopedRows.filter((row) => {
            const rowCountry = String(row.country_code || "").trim().toUpperCase();
            return rowCountry === "" || rowCountry === "ALL";
          })
        : [];
    const candidateRows =
      serviceScope === "international" ? [...countryRows, ...wildcardRows] : scopedRows;

    const matchedRule = candidateRows.find((row) => {
      const minWeight = Number(row.min_weight_kg || 0);
      const maxWeight = Number(row.max_weight_kg || 0);
      const weightMatches =
        taxableWeightKG >= minWeight && (maxWeight <= 0 || taxableWeightKG <= maxWeight);
      return weightMatches;
    });

    if (matchedRule) {
      label = String(matchedRule.label || "Listino admin");
      amountEUR = Number(matchedRule.price_eur || 0);
    }
  }

  if (amountEUR <= 0) {
    if (options?.strict) {
      throw new Error(
        "Il servizio selezionato non consente spedizioni con peso superiore al listino disponibile. Per colli extra ti invitiamo a portare il pacco in agenzia.",
      );
    }
    label = "Tariffa stimata";
    amountEUR =
      country === "IT"
        ? taxableWeightKG <= 3
          ? 8.9
          : taxableWeightKG <= 10
            ? 12.9
            : 16.9
        : 24.9;
  }

  return {
    label,
    amountCents: Math.max(100, Math.round(amountEUR * 100)),
  };
}
