import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { listPayhipOrders } from "@/lib/admin/portal-queries";

export const dynamic = "force-dynamic";

export default async function AdminPayhipPage() {
  const result = await listPayhipOrders(100);

  return (
    <ModuleFrame
      eyebrow="Bridge"
      title="PayHip"
      description="Ordini PayHip in sola lettura. Bridge email → cliente portale quando match."
    >
      {!result.ok ? (
        <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
      ) : result.rows.length === 0 ? (
        <ModuleNotice variant="empty">Nessun ordine PayHip.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["ID", "Email", "Prodotto", "Importo", "Stato", "Data"]}
          rows={result.rows.map((r) => [
            String(r.id),
            String(r.email || "—"),
            String(r.product_name || "—"),
            r.amount != null ? `${r.amount} ${r.currency || "EUR"}` : "—",
            String(r.status || "—"),
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
