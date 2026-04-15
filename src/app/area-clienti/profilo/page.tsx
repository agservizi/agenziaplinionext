import Link from "next/link";
import Container from "@/components/Container";
import ClientProfilePanel from "@/components/client-area/ClientProfilePanel";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Profilo Cliente",
    description: "Riepilogo del profilo attivo nell'area clienti AG SERVIZI.",
    path: "/area-clienti/profilo",
  });
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AreaClientiProfiloPage() {
  return (
    <div className="min-h-full">
      <div className="relative">
        <div className="h-px bg-linear-to-r from-slate-400/30 via-slate-400/10 to-transparent" />
        <div className="border-b border-white/6 bg-slate-950 px-6 pt-5 pb-6 md:px-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-slate-600">
            <Link href="/area-clienti" className="transition hover:text-slate-400">Dashboard</Link>
            <Chevron />
            <span className="text-slate-500">Profilo</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">
                Impostazioni account
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                Dati anagrafici, contatti e sicurezza del tuo accesso all&apos;area clienti.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 pb-16 pt-8 text-slate-950">
        <Container>
          <ClientProfilePanel />
        </Container>
      </div>
    </div>
  );
}
