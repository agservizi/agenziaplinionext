import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getClientAreaConfig } from "@/lib/client-area";
import { notifyClientAreaEvent } from "@/lib/area-client-notifications";

export const runtime = "nodejs";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

async function ensureClientAreaRequestsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      area VARCHAR(40) NOT NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      notes TEXT DEFAULT '',
      details_json JSON NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_requests_area (area),
      KEY idx_client_area_requests_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  const body = await request.json();
  const area = String(body?.area || "").trim();
  const serviceType = String(body?.serviceType || "").trim();
  const customerName = String(body?.customerName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").trim();
  const notes = String(body?.notes || "").trim();
  const details =
    body?.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? body.details
      : {};

  const config = getClientAreaConfig(area);
  if (!config) {
    return NextResponse.json({ message: "Area non valida." }, { status: 400 });
  }

  if (!serviceType || !customerName || !email || !email.includes("@")) {
    return NextResponse.json(
      { message: "Compila nome, email e servizio richiesto." },
      { status: 400 },
    );
  }

  const selectedService = config.serviceOptions.find((option) => option.value === serviceType);
  if (!selectedService) {
    return NextResponse.json({ message: "Servizio non valido." }, { status: 400 });
  }

  for (const field of config.fields) {
    if (field.required && !String(details[field.id] || "").trim()) {
      return NextResponse.json(
        { message: `Compila il campo obbligatorio: ${field.label}.` },
        { status: 400 },
      );
    }
  }

  await ensureClientAreaRequestsTable();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
    [area, serviceType, customerName, email, phone, notes, JSON.stringify(details)],
  );

  void notifyClientAreaEvent({
    area,
    title: "Nuova richiesta area clienti",
    customerName,
    customerEmail: email,
    customerPhone: phone,
    details: {
      servizio: serviceType,
      stato: "new",
    },
  });

  return NextResponse.json(
    {
      message:
        "Richiesta registrata. Ti contatteremo per conferma operativa, documenti e prossimi passaggi.",
    },
    { status: 200 },
  );
}
