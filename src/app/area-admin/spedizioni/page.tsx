import AdminShipmentsDashboard from "@/components/admin-area/AdminShipmentsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Admin Spedizioni | AG SERVIZI",
    description: "Cockpit operativo spedizioni con tracking, manifest, pagamenti e stato pratica.",
    path: "/area-admin/spedizioni",
  });
}

export default function AreaAdminSpedizioniPage() {
  return (
    <div className="space-y-6 pb-16">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Focus Spedizioni
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Cockpit operativo spedizioni</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Qui gestisco in modo dedicato stato richiesta, tracking, manifest, pagamento e dati cliente
          senza passare dal quadro richieste generico.
        </p>
      </section>

      <AdminShipmentsDashboard />
    </div>
  );
}
