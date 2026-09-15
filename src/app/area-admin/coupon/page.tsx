import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import { listVouchers } from "@/lib/saleor/admin-ops";

export const dynamic = "force-dynamic";

export default async function AdminCouponPage() {
  const result = process.env.SALEOR_APP_TOKEN
    ? await listVouchers(50)
    : { ok: false as const, items: [], error: "SALEOR_APP_TOKEN missing" };

  return (
    <ModuleFrame eyebrow="Shop · Promo" title="Coupon" description="Voucher Saleor % o fisso.">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ApiForm
          endpoint="/api/admin/shop/coupons"
          submitLabel="Crea coupon"
          fields={[
            { name: "code", label: "Codice", required: true, placeholder: "SCONTO10" },
            { name: "discountValue", label: "Valore", type: "number", required: true },
            { name: "type", label: "Tipo (PERCENTAGE|FIXED)", defaultValue: "PERCENTAGE" },
            { name: "minSpent", label: "Min ordine EUR (opz.)", type: "number" },
          ]}
        />
        <div>
          {!result.ok ? (
            <ModuleNotice variant="warning">{result.error || "Coupon non disponibili"}</ModuleNotice>
          ) : result.items.length === 0 ? (
            <ModuleNotice variant="empty">Nessun voucher.</ModuleNotice>
          ) : (
            <ModuleTable
              headers={["Codice", "Tipo", "Valore"]}
              rows={result.items.map((v) => [
                v.code || "—",
                v.type,
                String(v.discountValue),
              ])}
            />
          )}
        </div>
      </div>
    </ModuleFrame>
  );
}
