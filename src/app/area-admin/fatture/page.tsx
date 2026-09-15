import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { listInvoices } from "@/lib/admin/portal-queries";

export const dynamic = "force-dynamic";

export default async function AdminFatturePage() {
  const result = await listInvoices(100);

  return (
    <ModuleFrame
      eyebrow="Sistema"
      title="Fatture"
      description="Ricevute servizi legacy e bridge shop."
    >
      {!result.ok ? (
        <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
      ) : result.rows.length === 0 ? (
        <ModuleNotice variant="empty">Nessuna fattura registrata.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["ID", "Request", "Payment", "Provider", "Stato", "PDF", "Data"]}
          rows={result.rows.map((r) => [
            String(r.id),
            String(r.request_id ?? "—"),
            String(r.payment_id ?? "—"),
            String(r.provider || "—"),
            String(r.status || "—"),
            r.invoice_pdf_url ? "disponibile" : "—",
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
