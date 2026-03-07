import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyAdminPortalToken } from "@/lib/admin-portal-server";

export const runtime = "nodejs";

const STATUS_VALUES = new Set(["aperto", "in_lavorazione", "in_attesa_cliente", "chiuso"]);

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
    const storedName = `${ticketIdHint}-admin-${Date.now()}-${index + 1}-${baseName}${extension}`;
    const absolutePath = path.join(uploadDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);
    urls.push(`${siteUrl}/uploads/ticket-pratiche/${storedName}`);
  }

  return urls;
}

async function createTicket(args: {
  requestId: number | null;
  customerName: string;
  email: string;
  phone: string;
  ticketArea: string;
  subject: string;
  message: string;
  priority: string;
  files: File[];
  source: "admin" | "customer";
}) {
  const attachmentUrls = await saveAttachments(
    args.files,
    `${Date.now()}-${args.source}-${args.email.replace(/[^a-z0-9]/gi, "").slice(0, 24) || "ticket"}`,
  );
  const pool = getPool();

  const [insertResult] = await pool.execute(
    `INSERT INTO client_area_tickets
      (request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aperto', ?)`,
    [
      args.requestId,
      args.customerName,
      args.email,
      args.phone,
      args.ticketArea,
      args.subject,
      args.message,
      args.priority || "normale",
      JSON.stringify(attachmentUrls),
    ],
  );

  const ticketId = Number((insertResult as any)?.insertId || 0);
  if (ticketId > 0) {
    await pool.execute(
      `INSERT INTO client_area_ticket_messages
        (ticket_id, author_role, author_name, message, attachments_json)
       VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        args.source === "admin" ? "admin" : "customer",
        args.source === "admin" ? "Backoffice" : args.customerName,
        args.message,
        JSON.stringify(attachmentUrls),
      ],
    );
  }

  return {
    id: ticketId,
    requestId: args.requestId,
    customerName: args.customerName,
    email: args.email,
    phone: args.phone,
    ticketArea: args.ticketArea,
    subject: args.subject,
    message: args.message,
    priority: args.priority || "normale",
    status: "aperto",
    attachments: attachmentUrls,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 0,
        ticketId,
        authorRole: args.source,
        authorName: args.source === "admin" ? "Backoffice" : args.customerName,
        message: args.message,
        attachments: attachmentUrls,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

async function listTickets(body: Record<string, unknown>) {
  const area = String(body?.area || "").trim();
  const status = String(body?.status || "").trim();
  const search = String(body?.search || "").trim().toLowerCase();

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (area && area !== "all") {
    clauses.push("ticket_area = ?");
    params.push(area);
  }
  if (status && status !== "all") {
    clauses.push("status = ?");
    params.push(status);
  }
  if (search) {
    clauses.push("(customer_name LIKE ? OR email LIKE ? OR subject LIKE ?)");
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json, created_at, updated_at
     FROM client_area_tickets
     ${where}
     ORDER BY created_at DESC
     LIMIT 120`,
    params,
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

export async function POST(request: Request) {
  const token = String(request.headers.get("x-admin-token") || "").trim();
  if (!verifyAdminPortalToken(token)) {
    return NextResponse.json({ message: "Sessione admin non valida" }, { status: 401 });
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato." }, { status: 503 });
  }

  await ensureClientAreaTicketsTable();
  await ensureClientAreaTicketMessagesTable();

  try {
    const contentType = String(request.headers.get("content-type") || "");
    const pool = getPool();

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      const action = String(body?.action || "list").trim().toLowerCase();

      if (action === "list") {
        return await listTickets(body);
      }

      if (action === "status") {
        const ticketId = Number(body?.ticketId || 0);
        const status = String(body?.status || "").trim().toLowerCase();
        if (!ticketId || !STATUS_VALUES.has(status)) {
          return NextResponse.json({ message: "Dati stato ticket non validi." }, { status: 400 });
        }

        await pool.execute(`UPDATE client_area_tickets SET status = ? WHERE id = ?`, [status, ticketId]);
        return NextResponse.json({ message: "Stato ticket aggiornato." }, { status: 200 });
      }

      if (action === "create") {
        const customerName = String(body?.customerName || "").trim();
        const email = String(body?.email || "")
          .trim()
          .toLowerCase();
        const phone = String(body?.phone || "").trim();
        const ticketArea = String(body?.ticketArea || "generale").trim();
        const subject = String(body?.subject || "").trim();
        const message = String(body?.message || "").trim();
        const priority = String(body?.priority || "normale").trim();
        const requestIdValue = Number(body?.requestId || 0);
        const requestId =
          Number.isFinite(requestIdValue) && requestIdValue > 0 ? requestIdValue : null;

        if (!customerName || !email.includes("@") || !subject || !message) {
          return NextResponse.json(
            { message: "Compila nome, email, oggetto e messaggio del ticket." },
            { status: 400 },
          );
        }

        const ticket = await createTicket({
          requestId,
          customerName,
          email,
          phone,
          ticketArea,
          subject,
          message,
          priority,
          files: [],
          source: "admin",
        });

        return NextResponse.json(
          {
            message: "Ticket aperto dal backoffice per conto cliente.",
            ticket,
          },
          { status: 200 },
        );
      }

      return NextResponse.json({ message: "Azione non valida." }, { status: 400 });
    }

    const formData = await request.formData();
    const formAction = String(formData.get("action") || "reply").trim().toLowerCase();

    if (formAction === "create") {
      const customerName = String(formData.get("customerName") || "").trim();
      const email = String(formData.get("email") || "")
        .trim()
        .toLowerCase();
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

      const ticket = await createTicket({
        requestId,
        customerName,
        email,
        phone,
        ticketArea,
        subject,
        message,
        priority,
        files,
        source: "admin",
      });

      return NextResponse.json(
        {
          message: "Ticket aperto dal backoffice per conto cliente.",
          ticket,
        },
        { status: 200 },
      );
    }

    const ticketId = Number(formData.get("ticketId") || 0);
    const message = String(formData.get("message") || "").trim();
    const adminName = String(formData.get("adminName") || "Backoffice").trim();
    const nextStatusRaw = String(formData.get("status") || "").trim().toLowerCase();
    const nextStatus = STATUS_VALUES.has(nextStatusRaw) ? nextStatusRaw : "in_lavorazione";
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!ticketId || !message) {
      return NextResponse.json({ message: "Inserisci ticket e risposta operatore." }, { status: 400 });
    }

    const [ticketRows] = await pool.query(`SELECT id FROM client_area_tickets WHERE id = ? LIMIT 1`, [
      ticketId,
    ]);
    if (!Array.isArray(ticketRows) || ticketRows.length === 0) {
      return NextResponse.json({ message: "Ticket non trovato." }, { status: 404 });
    }

    const attachmentUrls = await saveAttachments(files, String(ticketId));
    await pool.execute(
      `INSERT INTO client_area_ticket_messages
        (ticket_id, author_role, author_name, message, attachments_json)
       VALUES (?, 'admin', ?, ?, ?)`,
      [ticketId, adminName || "Backoffice", message, JSON.stringify(attachmentUrls)],
    );
    await pool.execute(`UPDATE client_area_tickets SET status = ? WHERE id = ?`, [nextStatus, ticketId]);

    return NextResponse.json(
      {
        message: "Risposta operatore inviata.",
        reply: {
          ticketId,
          authorRole: "admin",
          authorName: adminName || "Backoffice",
          message,
          attachments: attachmentUrls,
          createdAt: new Date().toISOString(),
          status: nextStatus,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile gestire i ticket lato admin.",
      },
      { status: 500 },
    );
  }
}
