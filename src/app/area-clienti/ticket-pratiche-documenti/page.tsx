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
    <div className="min-h-full bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <nav className="mb-5 flex items-center gap-2 text-xs text-[var(--ink)]/45">
          <Link href="/area-clienti" className="transition hover:text-[var(--ink)]">Dashboard</Link>
          <Chevron />
          <span>Ticket</span>
        </nav>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Area clienti</p>
        <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Ticket pratiche & documenti</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Gestisci integrazioni documentali e richieste su pratiche già avviate. Il team riceve notifica
          immediata e aggiorna lo stato nel tuo storico.
        </p>
      </section>

      <Container className="py-8">
        <TicketPraticheWorkspace />
      </Container>
    </div>
  );
}
