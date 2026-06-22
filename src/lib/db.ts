import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: Number(process.env.MYSQL_PORT ?? 3306),
      connectionLimit: 10,
    });
  }

  return pool;
}

const ensuredTables = new Set<string>();

export function markTableEnsured(name: string) {
  ensuredTables.add(name);
}

export function isTableEnsured(name: string): boolean {
  return ensuredTables.has(name);
}
