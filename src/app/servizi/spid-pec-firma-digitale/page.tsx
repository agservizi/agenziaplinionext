import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "SPID, PEC e Firma Digitale a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: attivazioni SPID, PEC e Firma Digitale con supporto Namirial e assistenza in sede.",
    path: "/servizi/spid-pec-firma-digitale",
  });
}

export default function SpidPecFirmaPage() {
  const category = serviceCategories.find((item) => item.id === "digitali");

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Servizi digitali
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              SPID, PEC e Firma Digitale a Castellammare di Stabia
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Attivazioni rapide, assistenza Namirial e supporto completo per
              identità digitale, PEC e firma elettronica.
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
              Partner Namirial
            </p>
            <p className="mt-3 text-base text-slate-200">
              Attivazioni certificate, verifica documentale e supporto post
              attivazione per servizi digitali.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Identità digitale"
              title="SPID, PEC e firma digitale con supporto locale"
              description="Procedura assistita, tempi rapidi e consulenza dedicata in sede."
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
              Servizi digitali a Castellammare di Stabia
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Supporto completo su attivazioni, rinnovi e gestione dei servizi
              digitali essenziali per privati e aziende.
            </p>
          </Container>
        </section>
      </div>
    </div>
  );
}
