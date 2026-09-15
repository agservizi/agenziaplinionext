import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { fetchShopOrders } from "@/lib/saleor/client";

export const dynamic = "force-dynamic";

export default async function AdminSpedizioniShopPage() {
  const result = process.env.SALEOR_APP_TOKEN
    ? await fetchShopOrders(50)
    : { ok: false, orders: [], totalCount: 0 };

  const physical = result.ok
    ? result.orders.filter((o) => {
        const s = (o.status || "").toUpperCase();
        return s.includes("UNFULFILLED") || s.includes("PARTIAL") || s.includes("FULFILLED");
      })
    : [];

  return (
    <ModuleFrame
      eyebrow="Shop · Fulfillment"
      title="Spedizioni shop"
      description="Coda ordini PHYSICAL / unfulfilled da Saleor."
    >
      {!result.ok ? (
        <ModuleNotice variant="warning">Saleor non disponibile.</ModuleNotice>
      ) : physical.length === 0 ? (
        <ModuleNotice variant="empty">Nessuna spedizione shop in coda.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["#", "Email", "Stato", "Totale", "Data"]}
          rows={physical.map((o) => [
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
