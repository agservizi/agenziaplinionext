import Link from "next/link";
import Container from "@/components/Container";
import TicketPraticheWorkspace from "@/components/client-area/TicketPraticheWorkspace";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Ticket Pratiche e Documenti | Area Clienti AG SERVIZI",
    description:
      "Apri ticket operativi, allega documenti e monitora lo stato delle pratiche in area clienti.",
    path: "/area-clienti/ticket-pratiche-documenti",
  });
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TicketPraticheDocumentiPage() {
  return (
    <div className="min-h-full">
      <div className="relative">
        <div className="h-px bg-linear-to-r from-sky-500/50 via-sky-400/20 to-transparent" />
        <div className="border-b border-white/6 bg-slate-950 px-6 pt-5 pb-6 md:px-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-slate-600">
            <Link href="/area-clienti" className="transition hover:text-slate-400">Dashboard</Link>
            <Chevron />
            <span className="text-slate-500">Ticket</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">
                Ticket Pratiche & Documenti
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                Gestisci integrazioni documentali e richieste su pratiche già avviate. Il team riceve
                notifica immediata e aggiorna lo stato direttamente nel tuo storico.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lux-surface text-slate-900">
        <Container className="py-8">
          <TicketPraticheWorkspace />
        </Container>
      </div>
    </div>
  );
}
