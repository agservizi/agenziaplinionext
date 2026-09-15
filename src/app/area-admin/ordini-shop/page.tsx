import Link from "next/link";
import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ActionButton } from "@/components/portal/ApiForm";
import { fetchShopOrders, isSaleorConfigured } from "@/lib/saleor/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdiniShopPage() {
  const configured = isSaleorConfigured();
  const hasToken = Boolean(process.env.SALEOR_APP_TOKEN);
  const result =
    configured && hasToken
      ? await fetchShopOrders(50)
      : {
          ok: false,
          orders: [],
          totalCount: 0,
          error: !configured ? "not configured" : "missing app token",
        };

  return (
    <ModuleFrame
      eyebrow="Shop · Saleor"
      title="Ordini shop"
      description="Lista, cancel e refund (ADMIN+) via BFF."
    >
      {!configured || !hasToken ? (
        <ModuleNotice variant="warning">
          Serve Saleor API + <code className="font-mono">SALEOR_APP_TOKEN</code>.
        </ModuleNotice>
      ) : null}
      {configured && hasToken && !result.ok ? (
        <ModuleNotice variant="error">{result.error || "Errore orders."}</ModuleNotice>
      ) : null}
      {result.ok && result.orders.length === 0 ? (
        <ModuleNotice variant="empty">Nessun ordine shop.</ModuleNotice>
      ) : null}
      {result.orders.length > 0 ? (
        <ModuleTable
          headers={["#", "Email", "Stato", "Totale", "Data", "Azioni"]}
          rows={result.orders.map((o) => [
            o.number || o.id.slice(-8),
            o.userEmail || "—",
            o.status || "—",
            o.total ? `${o.total.amount.toFixed(2)} ${o.total.currency}` : "—",
            o.created ? new Date(o.created).toLocaleString("it-IT") : "—",
            <div key={o.id} className="flex flex-wrap gap-2">
              <Link href={`/area-admin/ordini-shop/${encodeURIComponent(o.id)}`} className="text-cyan-700 font-semibold hover:underline">
                Apri
              </Link>
              <ActionButton
                endpoint="/api/admin/shop/orders"
                body={{ action: "cancel", orderId: o.id }}
                label="Annulla"
                confirm="Annullare l'ordine?"
              />
              <ActionButton
                endpoint="/api/admin/shop/orders"
                body={{ action: "refund", orderId: o.id }}
                label="Rimborsa"
                confirm="Emettere rimborso?"
              />
            </div>,
          ])}
        />
      ) : null}
    </ModuleFrame>
  );
}
