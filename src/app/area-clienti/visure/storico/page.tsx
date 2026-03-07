import Link from "next/link";
import Container from "@/components/Container";
import OpenApiVisureHistory from "@/components/client-area/OpenApiVisureHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico Visure | Area Clienti",
    description: "Storico richieste visure con stato pratica e documenti disponibili.",
    path: "/area-clienti/visure/storico",
  });
}

export default function AreaClientiVisureStoricoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Storico visure
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Le richieste gia inviate e in gestione.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Qui controlli in un solo posto stato pratica, riferimento richiesta e documento
              disponibile.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/area-clienti/visure"
                className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Torna all'area visure
              </Link>
              <Link
                href="/area-clienti"
                className="inline-flex rounded-full border border-slate-700 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-900/60"
              >
                Dashboard clienti
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Cosa vedo qui
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• Stato della pratica interna</li>
              <li>• Stato di lavorazione della richiesta</li>
              <li>• Riferimento e documento, se già pronto</li>
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <OpenApiVisureHistory />
          </Container>
        </section>
      </div>
    </div>
  );
}
