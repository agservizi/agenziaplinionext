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

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AreaClientiFotocopiePage() {
  if (!area) return null;

  return (
    <div className="min-h-full">
      <div className="relative">
        <div className="h-px bg-linear-to-r from-pink-500/50 via-pink-400/20 to-transparent" />
        <div className="border-b border-white/6 bg-slate-950 px-6 pt-5 pb-6 md:px-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-slate-600">
            <Link href="/area-clienti" className="transition hover:text-slate-400">Dashboard</Link>
            <Chevron />
            <span className="text-slate-500">{area.eyebrow}</span>
          </nav>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-pink-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <rect x="7" y="2" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 9H19a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
                  <rect x="7" y="14" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white md:text-3xl">{area.title}</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                  {area.description}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/area-clienti/fotocopie/storico"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                Storico stampe
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/6 bg-white/3 px-4 py-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Tariffe:</span>
            20–100 pag. → 0,10 €/pag · 101–200 pag. → 0,07 €/pag · 201–500 pag. → 0,05 €/pag
            <span className="hidden sm:inline">· Solo residenti a Castellammare di Stabia · Ritiro in sede</span>
          </div>
        </div>
      </div>

      <div className="lux-surface text-slate-900">
        <Container className="py-8">
          <PhotocopyWorkspace />
        </Container>
      </div>
    </div>
  );
}
