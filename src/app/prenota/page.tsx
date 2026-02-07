import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import BookingWizard from "@/components/BookingWizard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Prenota un appuntamento",
    description:
      "Prenota online il tuo appuntamento con AG SERVIZI: scelta servizio, data, orario e conferma immediata.",
    path: "/prenota",
  });
}

export default function PrenotaPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Prenotazione online
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Prenota il tuo appuntamento in pochi minuti.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Seleziona servizio, data e orario disponibili. Riceverai una conferma
              immediata via email con i dettagli dell’incontro.
            </p>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Vantaggi
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• Prenotazione 24/7</li>
              <li>• Slot aggiornati in tempo reale</li>
              <li>• Invito automatico in calendario</li>
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Prenota"
              title="Scegli servizio, data e orario"
              description="Un flusso semplice e guidato per confermare il tuo appuntamento con AG SERVIZI."
              tone="dark"
            />
          </Container>
        </section>

        <section className="py-6">
          <Container className="lux-panel rounded-3xl p-6">
            <BookingWizard />
          </Container>
        </section>
      </div>
    </div>
  );
}
