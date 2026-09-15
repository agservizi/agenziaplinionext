import Link from "next/link";
import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ActionButton } from "@/components/portal/ApiForm";
import { fetchOrderById } from "@/lib/saleor/admin-ops";

export const dynamic = "force-dynamic";

export default async function AdminOrdineShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = process.env.SALEOR_APP_TOKEN
    ? await fetchOrderById(id)
    : { ok: false as const, order: null, error: "SALEOR_APP_TOKEN missing" };

  return (
    <ModuleFrame
      eyebrow="Shop · Ordine"
      title={detail.order ? `Ordine #${detail.order.number}` : `Ordine`}
      description="Line items, payment, fulfillment."
      actions={
        <Link href="/area-admin/ordini-shop" className="text-sm font-semibold text-cyan-700 hover:underline">
          ← Lista
        </Link>
      }
    >
      {!detail.ok || !detail.order ? (
        <ModuleNotice variant="error">{detail.error || "Ordine non trovato"}</ModuleNotice>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs uppercase text-slate-400">Stato</p>
              <p className="mt-1 font-semibold">{detail.order.status}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs uppercase text-slate-400">Email</p>
              <p className="mt-1 font-semibold">{detail.order.userEmail || "—"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs uppercase text-slate-400">Totale</p>
              <p className="mt-1 font-semibold">
                {detail.order.total.gross.amount.toFixed(2)} {detail.order.total.gross.currency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                endpoint="/api/admin/shop/orders"
                body={{ action: "cancel", orderId: id }}
                label="Annulla"
                confirm="Annullare?"
              />
              <ActionButton
                endpoint="/api/admin/shop/orders"
                body={{ action: "refund", orderId: id }}
                label="Rimborsa"
                confirm="Rimborsare?"
              />
            </div>
          </div>

          <ModuleTable
            headers={["Prodotto", "Qty", "SKU", "Totale"]}
            rows={detail.order.lines.map((l) => [
              l.productName,
              String(l.quantity),
              l.variant?.sku || "—",
              `${l.totalPrice.gross.amount.toFixed(2)} ${l.totalPrice.gross.currency}`,
            ])}
          />

          {detail.order.fulfillments.length > 0 ? (
            <ModuleTable
              headers={["Fulfillment", "Stato", "Tracking"]}
              rows={detail.order.fulfillments.map((f) => [
                f.id.slice(-8),
                f.status,
                f.trackingNumber || "—",
              ])}
            />
          ) : (
            <ModuleNotice variant="empty">Nessun fulfillment ancora.</ModuleNotice>
          )}
        </>
      )}
    </ModuleFrame>
  );
}
