import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import { listStocks } from "@/lib/saleor/admin-ops";

export const dynamic = "force-dynamic";

export default async function AdminInventarioPage() {
  const result = process.env.SALEOR_APP_TOKEN
    ? await listStocks(50)
    : { ok: false as const, items: [], error: "SALEOR_APP_TOKEN missing" };

  return (
    <ModuleFrame eyebrow="Shop · Saleor" title="Inventario" description="Stock per variante + adjust.">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ApiForm
          endpoint="/api/admin/shop/inventory"
          submitLabel="Aggiorna stock"
          fields={[
            { name: "variantId", label: "Variant ID", required: true },
            { name: "quantity", label: "Quantità", type: "number", required: true },
            { name: "warehouseId", label: "Warehouse ID (opz.)" },
          ]}
        />
        <div>
          {!result.ok ? (
            <ModuleNotice variant="warning">{result.error || "Inventario non disponibile"}</ModuleNotice>
          ) : result.items.length === 0 ? (
            <ModuleNotice variant="empty">Nessuna variante.</ModuleNotice>
          ) : (
            <ModuleTable
              headers={["Prodotto", "Variante", "SKU", "Stock"]}
              rows={result.items.map((i) => [
                i.product.name,
                i.name,
                i.sku || "—",
                i.stocks.map((s) => `${s.warehouse.name}: ${s.quantity}`).join(", ") || "0",
              ])}
            />
          )}
        </div>
      </div>
    </ModuleFrame>
  );
}
