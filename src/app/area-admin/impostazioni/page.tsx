import type { RowDataPacket } from "mysql2";
import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import { canAccessAdminModule, readStaffSession } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminImpostazioniPage() {
  const session = await readStaffSession();
  const allowed = session ? canAccessAdminModule(session.role, "settings") : false;

  let shopEnabled = true;
  let currency = "EUR";
  let vat = 22;

  if (allowed && process.env.MYSQL_HOST) {
    try {
      await ensureSaleorBridgeTables();
      const [rows] = await getPool().query<RowDataPacket[]>(
        `SELECT shop_enabled, default_currency, default_vat_rate FROM shop_settings WHERE id = 1 LIMIT 1`,
      );
      if (rows[0]) {
        shopEnabled = Boolean(rows[0].shop_enabled);
        currency = String(rows[0].default_currency || "EUR");
        vat = Number(rows[0].default_vat_rate ?? 22);
      }
    } catch {
      /* defaults */
    }
  }

  return (
    <ModuleFrame
      eyebrow="Sistema"
      title="Impostazioni"
      description="Shop on/off, valuta, IVA. Secret mai in chiaro."
      actions={
        <Link href="/area-admin/impostazioni/notifiche" className="text-sm font-semibold text-cyan-700 hover:underline">
          Notifiche email →
        </Link>
      }
    >
      {!allowed ? (
        <ModuleNotice variant="error">Accesso riservato a SUPERADMIN.</ModuleNotice>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Shop</p>
              <p className="mt-2 text-lg font-bold">{shopEnabled ? "attivo" : "spento"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Valuta</p>
              <p className="mt-2 text-lg font-bold">{currency}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">IVA default</p>
              <p className="mt-2 text-lg font-bold">{vat}%</p>
            </div>
          </div>
          <ApiForm
            endpoint="/api/admin/settings"
            submitLabel="Salva"
            fields={[
              {
                name: "shopEnabled",
                label: "Shop enabled (true|false)",
                defaultValue: shopEnabled ? "true" : "false",
                required: true,
              },
              { name: "defaultCurrency", label: "Valuta", defaultValue: currency, required: true },
              {
                name: "defaultVatRate",
                label: "IVA %",
                type: "number",
                defaultValue: String(vat),
                required: true,
              },
            ]}
            buildBody={(v) => ({
              shopEnabled: v.shopEnabled === "true",
              defaultCurrency: v.defaultCurrency,
              defaultVatRate: Number(v.defaultVatRate),
            })}
          />
        </div>
      )}
    </ModuleFrame>
  );
}
