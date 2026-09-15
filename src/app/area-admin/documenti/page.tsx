import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export const dynamic = "force-dynamic";

export default async function AdminDocumentiPage() {
  const rows: Array<{
    source: string;
    id: string;
    label: string;
    status: string;
    url: string;
  }> = [];

  if (process.env.MYSQL_HOST) {
    try {
      await ensureSaleorBridgeTables();
      const pool = getPool();
      const [invoices] = await pool.query<RowDataPacket[]>(
        `SELECT id, status, invoice_pdf_url, provider FROM client_area_invoices
         WHERE invoice_pdf_url IS NOT NULL AND invoice_pdf_url != ''
         ORDER BY id DESC LIMIT 50`,
      );
      for (const i of invoices) {
        rows.push({
          source: "fattura",
          id: String(i.id),
          label: `Fattura ${i.provider || ""}`.trim(),
          status: String(i.status || "—"),
          url: String(i.invoice_pdf_url),
        });
      }
      const [ents] = await pool.query<RowDataPacket[]>(
        `SELECT id, asset_key, revoked_at FROM shop_digital_entitlements
         WHERE revoked_at IS NULL ORDER BY id DESC LIMIT 50`,
      );
      for (const e of ents) {
        rows.push({
          source: "digital",
          id: String(e.id),
          label: String(e.asset_key),
          status: "entitlement",
          url: `/api/admin/shop/entitlements`,
        });
      }
    } catch {
      /* empty */
    }
  }

  return (
    <ModuleFrame
      eyebrow="Sistema"
      title="Documenti"
      description="Hub unificato fatture PDF + asset digitali."
    >
      {rows.length === 0 ? (
        <ModuleNotice variant="empty">
          Nessun documento in coda. I file compaiono quando una pratica o entitlement li genera.
        </ModuleNotice>
      ) : (
        <ModuleTable
          headers={["Fonte", "ID", "Documento", "Stato", "Link"]}
          rows={rows.map((r) => [
            r.source,
            r.id,
            r.label,
            r.status,
            r.source === "fattura" ? (
              <a key={r.id} href={r.url} className="font-semibold text-cyan-700 hover:underline" target="_blank" rel="noreferrer">
                PDF
              </a>
            ) : (
              "entitlement"
            ),
          ])}
        />
      )}
    </ModuleFrame>
  );
}
