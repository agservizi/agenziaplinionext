import Link from "next/link";
import Container from "@/components/Container";
import UtilityConsultingWorkspace from "@/components/client-area/UtilityConsultingWorkspace";
import { buildMetadata } from "@/lib/seo";
import { getClientAreaConfig } from "@/lib/client-area";

const area = getClientAreaConfig("consulenza-utenze");

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti Consulenza Utenze",
    description:
      "Modulo area clienti per richieste consulenza telefonia, luce e gas con registrazione lead e storico dedicato.",
    path: "/area-clienti/consulenza-utenze",
  });
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AreaClientiConsulenzaUtenzePage() {
  if (!area) return null;

  return (
    <div className="min-h-full">
      <div className="relative">
        <div className="h-px bg-linear-to-r from-amber-500/50 via-amber-400/20 to-transparent" />
        <div className="border-b border-white/6 bg-slate-950 px-6 pt-5 pb-6 md:px-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-slate-600">
            <Link href="/area-clienti" className="transition hover:text-slate-400">Dashboard</Link>
            <Chevron />
            <span className="text-slate-500">{area.eyebrow}</span>
          </nav>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M13 2L4.09 12.96A.5.5 0 0 0 4.5 13.75H11L10 22l9.91-11.96a.5.5 0 0 0-.41-.79H13L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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
                href="/area-clienti/consulenza-utenze/storico"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                Storico lead
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
          <UtilityConsultingWorkspace area={area} />
        </Container>
      </div>
    </div>
  );
}
