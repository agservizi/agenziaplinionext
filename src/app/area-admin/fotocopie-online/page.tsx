import AdminPhotocopyDashboard from "@/components/admin-area/AdminPhotocopyDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Admin Fotocopie Online | AG SERVIZI",
    description: "Gestione ordini fotocopie online con ritiro in sede, PDF, pagamento e stato ordine.",
    path: "/area-admin/fotocopie-online",
  });
}

export default function AreaAdminFotocopieOnlinePage() {
  return (
    <div className="space-y-6 pb-16">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Focus Fotocopie
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Ordini fotocopie con ritiro in sede</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Qui vedo PDF caricati, pagamenti, città, stato ordine e chiusura pratica senza mescolare il flusso con altre richieste.
        </p>
      </section>

      <AdminPhotocopyDashboard />
    </div>
  );
}
