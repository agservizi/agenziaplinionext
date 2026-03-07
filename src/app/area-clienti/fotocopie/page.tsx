import Link from "next/link";
import Container from "@/components/Container";
import PhotocopyWorkspace from "@/components/client-area/PhotocopyWorkspace";
import { buildMetadata } from "@/lib/seo";
import { getClientAreaConfig } from "@/lib/client-area";

const area = getClientAreaConfig("fotocopie-online");

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti Fotocopie Online",
    description:
      "Carica il PDF, calcolo pagine automatico e pagamento Stripe per il servizio fotocopie con ritiro in agenzia.",
    path: "/area-clienti/fotocopie",
  });
}

export default function AreaClientiFotocopiePage() {
  if (!area) return null;

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">{area.eyebrow}</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{area.title}</h1>
            <p className="text-base text-slate-300 md:text-lg">{area.description}</p>
            <Link
              href="/area-clienti"
              className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
            >
              Torna alla dashboard
            </Link>
          </div>

          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Tariffe fotocopie</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• Da 20 a 100 pagine: 0,10 € a pagina</li>
              <li>• Da 101 a 200 pagine: 0,07 € a pagina</li>
              <li>• Da 201 a 500 pagine: 0,05 € a pagina</li>
              <li>• Servizio attivo solo per residenti a Castellammare di Stabia</li>
              <li>• Ritiro esclusivamente in agenzia AG SERVIZI</li>
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <PhotocopyWorkspace />
          </Container>
        </section>
      </div>
    </div>
  );
}
