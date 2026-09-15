import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { readCustomerSession } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import {
  getCustomerEmailByUserId,
  listCustomerEntitlements,
  listCustomerInvoices,
} from "@/lib/client/portal-queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientDocumentiPage() {
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  const email =
    (userId ? await getCustomerEmailByUserId(userId) : null) ||
    (session?.username?.includes("@") ? session.username : null);

  const [invoices, entitlements] = await Promise.all([
    listCustomerInvoices(userId, email),
    listCustomerEntitlements(userId),
  ]);

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

  const hasAny = invoices.length > 0 || entitlements.length > 0 || serviceDocs.length > 0;

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Documenti"
      description="Hub CAF / visure / fatture / download digitali — solo tuoi."
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
                  <a key={String(r.id)} href={String(r.invoice_pdf_url)} className="text-cyan-300 font-semibold" target="_blank" rel="noreferrer">
                    PDF
                  </a>
                ) : (
                  "—"
                ),
              ])}
            />
          ) : null}
          {entitlements.length > 0 ? (
            <ModuleTable
              tone="client"
              headers={["Download", "Ordine", ""]}
              rows={entitlements.map((r) => [
                String(r.asset_key),
                String(r.saleor_order_id),
                <Link key={String(r.id)} href={`/api/client-area/shop/download?id=${r.id}`} className="text-cyan-300 font-semibold">
                  Scarica
                </Link>,
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
