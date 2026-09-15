import { getPool, isTableEnsured, markTableEnsured } from "@/lib/db";

export async function ensureSaleorBridgeTables() {
  if (isTableEnsured("saleor_bridge")) return;
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS saleor_customer_links (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      client_user_id BIGINT UNSIGNED NOT NULL,
      saleor_customer_id VARCHAR(64) NOT NULL,
      email VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_user (client_user_id),
      UNIQUE KEY uq_saleor_customer (saleor_customer_id),
      KEY idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS shop_digital_entitlements (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      client_user_id BIGINT UNSIGNED NOT NULL,
      saleor_order_id VARCHAR(64) NOT NULL,
      saleor_line_id VARCHAR(64) NULL,
      asset_key VARCHAR(512) NOT NULL,
      download_count INT UNSIGNED NOT NULL DEFAULT 0,
      max_downloads INT UNSIGNED NULL,
      expires_at DATETIME NULL,
      revoked_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_user (client_user_id),
      KEY idx_order (saleor_order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS saleor_order_mirrors (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      saleor_order_id VARCHAR(64) NOT NULL,
      client_user_id BIGINT UNSIGNED NULL,
      status VARCHAR(64) NULL,
      total_amount DECIMAL(12,2) NULL,
      currency CHAR(3) NULL,
      payload_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_saleor_order (saleor_order_id),
      KEY idx_user (client_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS staff_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL,
      email VARCHAR(191) NULL,
      password_hash VARCHAR(255) NULL,
      role ENUM('OPERATOR','ADMIN','SUPERADMIN') NOT NULL DEFAULT 'OPERATOR',
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_staff_username (username),
      KEY idx_staff_role (role),
      KEY idx_staff_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_shipping_addresses (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      client_user_id BIGINT UNSIGNED NOT NULL,
      kind ENUM('shipping','billing') NOT NULL DEFAULT 'shipping',
      full_name VARCHAR(191) NOT NULL,
      line1 VARCHAR(255) NOT NULL,
      line2 VARCHAR(255) NULL,
      city VARCHAR(120) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      province VARCHAR(8) NULL,
      country CHAR(2) NOT NULL DEFAULT 'IT',
      phone VARCHAR(80) NULL,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_addr_user (client_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_notification_prefs (
      client_user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
      order_confirm TINYINT(1) NOT NULL DEFAULT 1,
      shipped TINYINT(1) NOT NULL DEFAULT 1,
      digital_ready TINYINT(1) NOT NULL DEFAULT 1,
      service_update TINYINT(1) NOT NULL DEFAULT 1,
      marketing TINYINT(1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS shop_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      shop_enabled TINYINT(1) NOT NULL DEFAULT 1,
      default_currency CHAR(3) NOT NULL DEFAULT 'EUR',
      default_vat_rate DECIMAL(5,2) NOT NULL DEFAULT 22.00,
      feature_flags_json JSON NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  markTableEnsured("saleor_bridge");
}
