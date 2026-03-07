import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { sendInteractiveConsultationEmails } from "@/lib/area-client-notifications";
import { getPublicConsultingService, publicConsultingServiceKeys } from "@/lib/public-consulting";

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

function buildRequestCode(id: number) {
  const date = new Date();
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `CONS-${y}${m}${d}-${String(id).padStart(6, "0")}`;
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const serviceType = String(body?.serviceType || "")
      .trim()
      .toLowerCase();
    const customerName = String(body?.customerName || "").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const phone = String(body?.phone || "").trim();
    const customerType = String(body?.customerType || "privato")
      .trim()
      .toLowerCase();
    const city = String(body?.city || "").trim();
    const notes = String(body?.notes || "").trim();
    const details =
      body?.details && typeof body.details === "object" && !Array.isArray(body.details)
        ? (body.details as Record<string, unknown>)
        : {};

    if (!publicConsultingServiceKeys.has(serviceType)) {
      return NextResponse.json({ message: "Servizio non valido." }, { status: 400 });
    }
    if (!customerName || !email.includes("@") || !phone) {
      return NextResponse.json(
        { message: "Compila almeno nome, email valida e telefono." },
        { status: 400 },
      );
    }

    await ensureClientAreaRequestsTable();
    const pool = getPool();
    const [insertResult] = await pool.execute(
      `INSERT INTO client_area_requests
        (area, service_type, customer_name, email, phone, notes, details_json, status)
       VALUES ('consulenza-vetrina', ?, ?, ?, ?, ?, ?, 'new')`,
      [serviceType, customerName, email, phone, notes, JSON.stringify(details)],
    );

    const requestId = Number((insertResult as any)?.insertId || 0);
    const requestCode = buildRequestCode(requestId);
    const service = getPublicConsultingService(serviceType);

    void sendInteractiveConsultationEmails({
      requestCode,
      serviceLabel: service?.label || serviceType,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      companyType: customerType === "azienda" ? "Azienda" : "Privato",
      city,
      details: {
        servizio: service?.label || serviceType,
        codice: requestCode,
        id: String(requestId),
        ...details,
      },
    });

    return NextResponse.json(
      {
        message:
          "Richiesta inviata con successo. Ti abbiamo mandato una conferma email con il codice pratica.",
        requestId,
        requestCode,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Invio richiesta consulenza non riuscito.",
      },
      { status: 500 },
    );
  }
}

