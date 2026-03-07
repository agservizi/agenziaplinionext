import AdminPaymentsDashboard from "@/components/admin-area/AdminPaymentsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Pagamenti Area Admin | AG SERVIZI",
    description: "Monitoraggio pagamenti Stripe e stato fatture del portale clienti.",
    path: "/area-admin/pagamenti",
  });
}

export default function AreaAdminPaymentsPage() {
  return (
    <div className="space-y-6 pb-16 text-slate-950">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Sezione Pagamenti
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
          Qui controllo incassi e fatturazione collegati alle spedizioni.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
          In questa schermata tengo insieme il lato economico: pagamenti Stripe, importi incassati,
          stato della richiesta e avanzamento della fattura.
        </p>
      </section>

      <AdminPaymentsDashboard />
    </div>
  );
}
