import Link from "next/link";
import Container from "@/components/Container";
import WebAgencyHistory from "@/components/client-area/WebAgencyHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico brief Web Agency",
    description:
      "Cronologia brief progetto digitale con stato commerciale e proposte caricate in area clienti.",
    path: "/area-clienti/web-agency/storico",
  });
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AreaClientiWebAgencyStoricoPage() {
  return (
    <div className="min-h-full">
      <div className="relative">
        <div className="h-px bg-linear-to-r from-violet-500/50 via-violet-400/20 to-transparent" />
        <div className="border-b border-white/6 bg-slate-950 px-6 pt-5 pb-6 md:px-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-slate-600">
            <Link href="/area-clienti" className="transition hover:text-slate-400">Dashboard</Link>
            <Chevron />
            <Link href="/area-clienti/web-agency" className="transition hover:text-slate-400">Web Agency</Link>
            <Chevron />
            <span className="text-slate-500">Storico</span>
          </nav>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 9h18M3 15h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white md:text-3xl">Storico brief Web Agency</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Tipo progetto, budget, stato di lavorazione e proposta caricata per ogni brief inviato.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/area-clienti/web-agency"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Nuovo brief
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="lux-surface text-slate-900">
        <Container className="py-8">
          <WebAgencyHistory />
        </Container>
      </div>
    </div>
  );
}
