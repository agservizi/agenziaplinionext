import { Suspense } from "react";
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

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AreaClientiCafPage() {
  if (!area) return null;

  return (
    <div className="min-h-full">
      <div className="relative">
        <div className="h-px bg-linear-to-r from-emerald-500/50 via-emerald-400/20 to-transparent" />
        <div className="border-b border-white/6 bg-slate-950 px-6 pt-5 pb-6 md:px-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-slate-600">
            <Link href="/area-clienti" className="transition hover:text-slate-400">Dashboard</Link>
            <Chevron />
            <span className="text-slate-500">{area.eyebrow}</span>
          </nav>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
                href="/area-clienti/caf-patronato/storico"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                Storico pratiche
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="lux-surface text-slate-900">
        <Container className="py-8">
          <Suspense fallback={<p className="text-sm text-slate-500">Caricamento...</p>}>
            <CafPatronatoWorkspace />
          </Suspense>
        </Container>
      </div>
    </div>
  );
}
