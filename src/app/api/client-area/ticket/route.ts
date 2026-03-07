import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
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

async function ensureClientAreaTicketsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      ticket_area VARCHAR(80) NOT NULL DEFAULT 'generale',
      subject VARCHAR(191) NOT NULL,
      message TEXT NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'normale',
      status VARCHAR(40) NOT NULL DEFAULT 'aperto',
      attachments_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_tickets_email (email),
      KEY idx_client_area_tickets_status (status),
      KEY idx_client_area_tickets_area (ticket_area)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaTicketMessagesTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_ticket_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_id INT NOT NULL,
      author_role VARCHAR(20) NOT NULL DEFAULT 'customer',
      author_name VARCHAR(191) NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      attachments_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_ticket_messages_ticket (ticket_id),
      KEY idx_client_area_ticket_messages_role (author_role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function parseAttachmentsJson(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((value): value is string => typeof value === "string" && value.trim() !== "");
  }

  if (typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string" && value.trim() !== "")
      : [];
  } catch {
    return [];
  }
}

async function loadTicketMessages(ticketIds: number[]) {
  if (!ticketIds.length) {
    return new Map<number, any[]>();
  }

  const placeholders = ticketIds.map(() => "?").join(",");
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, ticket_id, author_role, author_name, message, attachments_json, created_at
     FROM client_area_ticket_messages
     WHERE ticket_id IN (${placeholders})
     ORDER BY created_at ASC, id ASC`,
    ticketIds,
  );

  const map = new Map<number, any[]>();
  if (!Array.isArray(rows)) {
    return map;
  }

  for (const row of rows as any[]) {
    const ticketId = Number(row.ticket_id || 0);
    if (!ticketId) continue;
    const list = map.get(ticketId) || [];
    list.push({
      id: Number(row.id || 0),
      ticketId,
      authorRole: String(row.author_role || "customer"),
      authorName: String(row.author_name || ""),
      message: String(row.message || ""),
      attachments: parseAttachmentsJson(row.attachments_json),
      createdAt: row.created_at,
    });
    map.set(ticketId, list);
  }

  return map;
}

async function saveAttachments(files: File[], ticketIdHint: string) {
  if (!files.length) return [] as string[];

  const uploadDir = path.join(process.cwd(), "public", "uploads", "ticket-pratiche");
  await fs.mkdir(uploadDir, { recursive: true });
  const siteUrl =
    String(process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "") ||
    "https://agenziaplinio.it";
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const extension = path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
    const baseName =
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || "allegato";
    const storedName = `${ticketIdHint}-${Date.now()}-${index + 1}-${baseName}${extension}`;
    const absolutePath = path.join(uploadDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);
    urls.push(`${siteUrl}/uploads/ticket-pratiche/${storedName}`);
  }

  return urls;
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato." }, { status: 503 });
  }

  await ensureClientAreaTicketsTable();
  await ensureClientAreaTicketMessagesTable();

  try {
    const contentType = String(request.headers.get("content-type") || "");

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const action = String(body?.action || "list").trim().toLowerCase();

      if (action !== "list") {
        return NextResponse.json({ message: "Azione non valida." }, { status: 400 });
      }

      const email = String(body?.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return NextResponse.json({ message: "Inserisci una email valida." }, { status: 400 });
      }

      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id, request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json, created_at, updated_at
         FROM client_area_tickets
         WHERE email = ?
         ORDER BY created_at DESC
         LIMIT 30`,
        [email],
      );

      const ticketsBase = Array.isArray(rows)
        ? rows.map((row: any) => ({
            id: Number(row.id || 0),
            requestId: Number(row.request_id || 0) || null,
            customerName: String(row.customer_name || ""),
            email: String(row.email || ""),
            phone: String(row.phone || ""),
            ticketArea: String(row.ticket_area || "generale"),
            subject: String(row.subject || ""),
            message: String(row.message || ""),
            priority: String(row.priority || "normale"),
            status: String(row.status || "aperto"),
            attachments: parseAttachmentsJson(row.attachments_json),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
        : [];

      const messageMap = await loadTicketMessages(ticketsBase.map((ticket) => ticket.id));
      const tickets = ticketsBase.map((ticket) => {
        const messages = messageMap.get(ticket.id) || [];
        const hasCustomerMessage = messages.some((entry) => entry.authorRole === "customer");

        if (!hasCustomerMessage) {
          messages.unshift({
            id: 0,
            ticketId: ticket.id,
            authorRole: "customer",
            authorName: ticket.customerName,
            message: ticket.message,
            attachments: ticket.attachments,
            createdAt: ticket.createdAt,
          });
        }

        return {
          ...ticket,
          messages,
        };
      });

      return NextResponse.json({ tickets }, { status: 200 });
    }

    const formData = await request.formData();
    const customerName = String(formData.get("customerName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const ticketArea = String(formData.get("ticketArea") || "generale").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const priority = String(formData.get("priority") || "normale").trim();
    const requestIdValue = Number(formData.get("requestId") || 0);
    const requestId = Number.isFinite(requestIdValue) && requestIdValue > 0 ? requestIdValue : null;
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!customerName || !email.includes("@") || !subject || !message) {
      return NextResponse.json(
        { message: "Compila nome, email, oggetto e messaggio del ticket." },
        { status: 400 },
      );
    }

    const ticketIdHint = `${Date.now()}`;
    const attachmentUrls = await saveAttachments(files, ticketIdHint);
    const pool = getPool();

    const [insertResult] = await pool.execute(
      `INSERT INTO client_area_tickets
        (request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aperto', ?)`,
      [
        requestId,
        customerName,
        email,
        phone,
        ticketArea,
        subject,
        message,
        priority || "normale",
        JSON.stringify(attachmentUrls),
      ],
    );

    const ticketId = Number((insertResult as any)?.insertId || 0);
    if (ticketId > 0) {
      await pool.execute(
        `INSERT INTO client_area_ticket_messages
          (ticket_id, author_role, author_name, message, attachments_json)
         VALUES (?, 'customer', ?, ?, ?)`,
        [ticketId, customerName, message, JSON.stringify(attachmentUrls)],
      );
    }

    void notifyClientAreaEvent({
      area: "ticket-pratiche",
      title: "Nuovo ticket pratiche/documenti",
      customerName,
      customerEmail: email,
      customerPhone: phone,
      details: {
        ticketId: ticketId ? `#${ticketId}` : "n/d",
        area: ticketArea,
        priorita: priority || "normale",
        richiestaCollegata: requestId ? `#${requestId}` : "nessuna",
      },
    });

    return NextResponse.json(
      {
        message:
          "Ticket aperto correttamente. Il backoffice ha ricevuto la richiesta e ti aggiornera nello storico.",
        ticket: {
          id: ticketId,
          requestId,
          customerName,
          email,
          phone,
          ticketArea,
          subject,
          message,
          priority: priority || "normale",
          status: "aperto",
          attachments: attachmentUrls,
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: 0,
              ticketId,
              authorRole: "customer",
              authorName: customerName,
              message,
              attachments: attachmentUrls,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile gestire il modulo ticket.",
      },
      { status: 500 },
    );
  }
}
