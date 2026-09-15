import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { fetchShopOrders } from "@/lib/saleor/client";

export const dynamic = "force-dynamic";

export default async function AdminPagamentiShopPage() {
  const result = process.env.SALEOR_APP_TOKEN
    ? await fetchShopOrders(50)
    : { ok: false, orders: [], totalCount: 0 };

  return (
    <ModuleFrame
      eyebrow="Shop · Pagamenti"
      title="Pagamenti shop"
      description="Vista riconciliazione ordini Saleor (status + totale)."
    >
      {!result.ok ? (
        <ModuleNotice variant="warning">Saleor non disponibile.</ModuleNotice>
      ) : result.orders.length === 0 ? (
        <ModuleNotice variant="empty">Nessun pagamento shop.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["Ordine", "Email", "Stato pagamento/ordine", "Importo", "Data"]}
          rows={result.orders.map((o) => [
            o.number || o.id.slice(-8),
            o.userEmail || "—",
            o.status || "—",
            o.total ? `${o.total.amount.toFixed(2)} ${o.total.currency}` : "—",
            o.created ? new Date(o.created).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
