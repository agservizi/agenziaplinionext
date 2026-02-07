import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Pagamenti e bollettini a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: pagamenti bollettini, F24, PagoPA e bonifici con assistenza locale e consulenza rapida.",
    path: "/servizi/pagamenti",
  });
}

export default function PagamentiPage() {
  const category = serviceCategories.find((item) => item.id === "pagamenti");

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Pagamenti
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Pagamenti e bollettini a Castellammare di Stabia
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Servizi di pagamento assistiti per privati e imprese: bollettini, F24,
              bonifici e PagoPA con supporto locale e tempi rapidi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi assistenza
              </Link>
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Tutti i servizi
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Supporto locale
            </p>
            <p className="mt-3 text-base text-slate-200">
              Ci trovi in sede a Castellammare di Stabia per pagamenti immediati,
              verifiche e consulenza su pratiche amministrative.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Servizi di pagamento"
              title="Pagamenti assistiti, chiari e veloci"
              description="Gestiamo le principali operazioni con controllo dei dati e ricevute immediate."
              tone="dark"
            />
          </Container>
        </section>

        <section className="py-6">
          <Container className="grid gap-6 md:grid-cols-2">
            {category?.items.map((item) => (
              <div key={item.title} className="lux-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </Container>
        </section>

        <section className="py-12">
          <Container className="lux-panel rounded-3xl p-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Perché scegliere AG SERVIZI a Castellammare di Stabia
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Supporto locale, controllo documenti e assistenza nella compilazione.
              Operazioni tracciate e tempi di gestione ottimizzati.
            </p>
          </Container>
        </section>
      </div>
    </div>
  );
}
