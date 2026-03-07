import AdminShippingPricingManager from "@/components/admin-area/AdminShippingPricingManager";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Listino Spedizioni Admin | AG SERVIZI",
    description: "Configurazione scaglioni spedizioni per peso e volume.",
    path: "/area-admin/listino-spedizioni",
  });
}

export default function AreaAdminShippingPricingPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Sezione Listino
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Qui imposto il prezzo reale delle spedizioni.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          In questa pagina definisco gli scaglioni di peso e volume. Appena salvo una regola, il
          costo live lato cliente usa questo listino invece della sola stima generica.
        </p>
      </section>

      <AdminShippingPricingManager />
    </div>
  );
}
