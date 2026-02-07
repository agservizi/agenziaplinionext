import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Web agency a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: realizzazione siti web e gestionali su misura con supporto locale.",
    path: "/servizi/web-agency",
  });
}

export default function WebAgencyPage() {
  const category = serviceCategories.find((item) => item.id === "web-agency");

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Web Agency
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Web agency a Castellammare di Stabia
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Progetti digitali su misura per imprese locali: siti web performanti,
              identità digitale e strumenti gestionali.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi una consulenza
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
              Progetti su misura
            </p>
            <p className="mt-3 text-base text-slate-200">
              Analisi obiettivi, UX e sviluppo con focus su performance e posizionamento locale.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Soluzioni web"
              title="Siti web e gestionali per aziende locali"
              description="Diamo valore al tuo brand con strumenti digitali evoluti e facili da gestire."
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
              Web agency locale a Castellammare di Stabia
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Siti ottimizzati per Google locale, supporto continuo e strategie di crescita digitale.
            </p>
          </Container>
        </section>
      </div>
    </div>
  );
}
