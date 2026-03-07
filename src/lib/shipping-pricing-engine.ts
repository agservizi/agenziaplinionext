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
}

export async function resolveShippingPrice(
  taxableWeightKG: number,
  volumeM3: number,
  destinationCountry: string,
) {
  let label = "Tariffa base";
  let amountEUR = 0;

  if (hasDatabaseConfig()) {
    await ensureShippingPricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         label,
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

    const matchedRule = Array.isArray(rows)
      ? (rows as any[]).find((row) => {
          const minWeight = Number(row.min_weight_kg || 0);
          const maxWeight = Number(row.max_weight_kg || 0);
          const minVolume = Number(row.min_volume_m3 || 0);
          const maxVolume = Number(row.max_volume_m3 || 0);
          const weightMatches =
            taxableWeightKG >= minWeight && (maxWeight <= 0 || taxableWeightKG <= maxWeight);
          const volumeMatches =
            volumeM3 >= minVolume && (maxVolume <= 0 || volumeM3 <= maxVolume);

          return weightMatches && volumeMatches;
        })
      : null;

    if (matchedRule) {
      label = String(matchedRule.label || "Listino admin");
      amountEUR = Number(matchedRule.price_eur || 0);
    }
  }

  if (amountEUR <= 0) {
    label = "Tariffa stimata";
    amountEUR =
      destinationCountry === "IT"
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
