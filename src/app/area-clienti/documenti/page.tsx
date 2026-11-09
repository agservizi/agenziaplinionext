import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { readCustomerSession } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { getCustomerEmailByUserId, listCustomerInvoices } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientDocumentiPage() {
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  const email =
    (userId ? await getCustomerEmailByUserId(userId) : null) ||
    (session?.username?.includes("@") ? session.username : null);

  const invoices = await listCustomerInvoices(userId, email);

  let serviceDocs: RowDataPacket[] = [];
  if (process.env.MYSQL_HOST && (userId || email)) {
    try {
      const [rows] = await getPool().query<RowDataPacket[]>(
        `SELECT id, area, service_type, status, created_at
         FROM client_area_requests
         WHERE (
           CAST(JSON_EXTRACT(details_json, '$.clientUserId') AS UNSIGNED) = ?
           OR LOWER(email) = LOWER(?)
         )
         ORDER BY id DESC LIMIT 50`,
        [userId || 0, email || ""],
      );
      serviceDocs = rows;
    } catch {
      serviceDocs = [];
    }
  }

  const hasAny = invoices.length > 0 || serviceDocs.length > 0;

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Documenti"
      description="Hub CAF / visure / fatture — solo tuoi."
    >
      {!hasAny ? (
        <ModuleNotice tone="client" variant="empty">
          Nessun documento pronto.
        </ModuleNotice>
      ) : (
        <div className="space-y-6">
          {invoices.length > 0 ? (
            <ModuleTable
              tone="client"
              headers={["Fattura", "Stato", ""]}
              rows={invoices.map((r) => [
                `#${r.id}`,
                String(r.status),
                r.invoice_pdf_url ? (
                  <a
                    key={String(r.id)}
                    href={String(r.invoice_pdf_url)}
                    className="font-semibold text-[#5E0ED7] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    PDF
                  </a>
                ) : (
                  "—"
                ),
              ])}
            />
          ) : null}
          {serviceDocs.length > 0 ? (
            <ModuleTable
              tone="client"
              headers={["Pratica", "Area", "Stato", "Data"]}
              rows={serviceDocs.map((r) => [
                String(r.service_type),
                String(r.area),
                String(r.status),
                r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
              ])}
            />
          ) : null}
        </div>
      )}
    </ModuleFrame>
  );
}
