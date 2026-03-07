import Link from "next/link";
import Container from "@/components/Container";
import BrtShipmentWorkspace from "@/components/client-area/BrtShipmentWorkspace";
import { buildMetadata } from "@/lib/seo";
import { getClientAreaConfig } from "@/lib/client-area";

const area = getClientAreaConfig("spedizioni");

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti Spedizioni",
    description:
      "Area clienti dedicata alle spedizioni AG SERVIZI con presa in carico richiesta, ritiro e supporto operativo.",
    path: "/area-clienti/spedizioni",
  });
}

export default function AreaClientiSpedizioniPage() {
  if (!area) return null;

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">{area.eyebrow}</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{area.title}</h1>
            <p className="text-base text-slate-300 md:text-lg">{area.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/area-clienti"
                className="rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Torna alla dashboard
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Procedura</p>
            <ol className="mt-4 space-y-3 text-sm text-slate-200">
              <li>1. Compila i dati completi di mittente, destinatario, colli e ritiro/consegna.</li>
              <li>2. Conferma la spedizione e completa il checkout Stripe per autorizzare il pagamento.</li>
              <li>3. A pagamento confermato la spedizione viene creata: trovi etichetta e tracking in area clienti.</li>
            </ol>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <BrtShipmentWorkspace area={area} />
          </Container>
        </section>
      </div>
    </div>
  );
}
