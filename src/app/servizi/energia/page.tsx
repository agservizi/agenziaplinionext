import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Luce e gas a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: attivazioni luce e gas, confronto tariffe e supporto locale per privati e aziende.",
    path: "/servizi/energia",
  });
}

export default function EnergiaPage() {
  const category = serviceCategories.find((item) => item.id === "energia");

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Energia
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Luce e gas a Castellammare di Stabia
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Attivazioni e consulenza per luce e gas con operatori selezionati,
              gestione pratiche e supporto locale.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi consulenza
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
              Consulenza energetica
            </p>
            <p className="mt-3 text-base text-slate-200">
              Analisi consumi, offerte personalizzate e gestione pratiche per
              privati e aziende.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Operatori luce e gas"
              title="Soluzioni energetiche ottimizzate"
              description="Confrontiamo offerte e curiamo attivazioni rapide per luce e gas."
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
              Energia con supporto locale a Castellammare di Stabia
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Assistenza su pratiche, volture e attivazioni con un referente
              dedicato in sede.
            </p>
          </Container>
        </section>
      </div>
    </div>
  );
}
