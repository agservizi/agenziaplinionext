import Link from "next/link";
import Container from "@/components/Container";
import CafPatronatoWorkspace from "@/components/client-area/CafPatronatoWorkspace";
import { buildMetadata } from "@/lib/seo";
import { getClientAreaConfig } from "@/lib/client-area";

const area = getClientAreaConfig("caf-patronato");

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti CAF e Patronato",
    description:
      "Area clienti dedicata a pratiche CAF e patronato con raccolta dati iniziale, richieste documenti e presa in carico.",
    path: "/area-clienti/caf-patronato",
  });
}

export default function AreaClientiCafPage() {
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Come funziona adesso
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <p>Compili il modulo, alleghi i documenti già pronti e scegli il servizio corretto.</p>
              <p>
                La pratica viene registrata subito e il team riceve una mail operativa con link
                diretto per lavorarla.
              </p>
              <p>
                Quando il documento è pronto, lo ritrovi nello storico pratiche senza dover passare
                in sede.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <Container>
          <CafPatronatoWorkspace />
        </Container>
      </div>
    </div>
  );
}
