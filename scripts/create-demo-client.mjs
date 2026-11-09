import fs from "node:fs";
import crypto from "node:crypto";
import mysql from "mysql2/promise";

/** One-shot: upsert demo row in client_portal_users. User: "creane uno demo". */
function loadEnv(path) {
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

loadEnv(".env");

const username = "demo";
const email = "demo@agenziaplinio.it";
const fullName = "Cliente Demo";
const password = "Demo2026!";
const passwordHash = hashPassword(password);

const pool = await mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT || 3306),
});

await pool.execute(`
  CREATE TABLE IF NOT EXISTS client_portal_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(191) NOT NULL DEFAULT '',
    username VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(80) DEFAULT '',
    company_name VARCHAR(191) DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_client_portal_users_username (username),
    UNIQUE KEY uq_client_portal_users_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);

const [rows] = await pool.query(
  "SELECT id FROM client_portal_users WHERE username = ? OR email = ? LIMIT 1",
  [username, email],
);

if (rows[0]) {
  await pool.execute(
    "UPDATE client_portal_users SET full_name = ?, password_hash = ?, status = 'active' WHERE id = ?",
    [fullName, passwordHash, rows[0].id],
  );
  console.log(`UPDATED id=${rows[0].id}`);
} else {
  const [result] = await pool.execute(
    `INSERT INTO client_portal_users
      (full_name, username, email, phone, company_name, password_hash, status)
     VALUES (?, ?, ?, '', '', ?, 'active')`,
    [fullName, username, email, passwordHash],
  );
  console.log(`CREATED id=${result.insertId}`);
}

await pool.end();
console.log(`OK username=${username} email=${email} password=${password}`);
