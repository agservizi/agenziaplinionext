import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import TicketPraticheWorkspace from "@/components/client-area/TicketPraticheWorkspace";

export function generateMetadata() {
  return buildMetadata({
    title: "Ticket Pratiche e Documenti | Area Clienti AG SERVIZI",
    description:
      "Apri ticket operativi, allega documenti e monitora lo stato delle pratiche in area clienti.",
    path: "/area-clienti/ticket-pratiche-documenti",
  });
}

export default function TicketPraticheDocumentiPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Area Clienti · Ticket
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Ticket Pratiche & Documenti per richieste operative tracciate
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            Questo modulo è pensato per gestire integrazioni documentali e richieste su pratiche
            già avviate, con storico consultabile dallo stesso cliente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/area-clienti"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200"
            >
              Torna alla dashboard clienti
            </Link>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-16 md:py-20">
          <Container className="space-y-8">
            <SectionHeading
              eyebrow="Modulo dedicato"
              title="Gestione ticket con allegati e stato pratica"
              description="Il team può prendere in carico rapidamente la richiesta e aggiornare la pratica con documenti e note operative."
              tone="dark"
              align="left"
            />
            <TicketPraticheWorkspace />
          </Container>
        </section>
      </div>
    </div>
  );
}
