import AdminVisureDashboard from "@/components/admin-area/AdminVisureDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Admin Visure | AG SERVIZI",
    description: "Controllo interno delle visure con stato provider OpenAPI e riferimenti pratica.",
    path: "/area-admin/visure",
  });
}

export default function AreaAdminVisurePage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Focus Visure
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Monitoraggio pratiche OpenAPI</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Qui tengo sott'occhio lo stato del provider, il riferimento OpenAPI e l'eventuale
          documento già pronto per il cliente.
        </p>
      </div>

      <AdminVisureDashboard />
    </div>
  );
}

