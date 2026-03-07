import AdminVisurePricingManager from "@/components/admin-area/AdminVisurePricingManager";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Listino Visure Admin | AG SERVIZI",
    description: "Configurazione prezzi visure per il modulo clienti.",
    path: "/area-admin/listino-visure",
  });
}

export default function AreaAdminVisurePricingPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Sezione Listino
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Qui imposto il prezzo reale delle visure.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          In questa pagina definisco il costo per ogni tipologia di visura. Appena salvo una
          regola, il prezzo mostrato al cliente e quello usato in Stripe si aggiornano insieme.
        </p>
      </section>

      <AdminVisurePricingManager />
    </div>
  );
}

