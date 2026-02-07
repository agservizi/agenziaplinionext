import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { company, values } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Chi siamo | AG SERVIZI Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: agenzia di servizi con consulenza dal 2016 per telefonia, energia, pagamenti e servizi digitali.",
    path: "/chi-siamo",
  });
}

export default function ChiSiamoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-32 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Chi siamo
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Competenza locale, visione moderna.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Un’agenzia di servizi attiva dal 2016, orientata alla consulenza e
              alla costruzione di relazioni di fiducia con privati e aziende.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Contattaci
              </Link>
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Scopri i servizi
              </Link>
            </div>
            <div className="grid gap-4 pt-6 md:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="premium-panel rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,47,73,0.45)]"
                >
                  <p className="text-base font-semibold text-white">{value.title}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-[32px] p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Focus strategico
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Un unico partner per servizi essenziali e digitalizzazione.
              </h2>
              <p className="text-sm text-slate-300">
                Mettiamo al centro ascolto, chiarezza e risultati misurabili per
                offrire una consulenza che semplifica e migliora le decisioni.
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Approccio consulenziale su misura.</li>
                <li>• Presenza locale con supporto continuativo.</li>
                <li>• Focus su qualità e innovazione.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Chi siamo"
                title="Consulenza locale, approccio moderno"
                description="Dal 1° giugno 2016 affianchiamo privati e aziende con un metodo chiaro, consulenze su misura e un supporto continuativo."
                tone="dark"
              />
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {[
                  "Attivi dal 2016",
                  "Presenza locale",
                  "Soluzioni su misura",
                  "Team dedicato",
                ].map((pill) => (
                  <span key={pill} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="lux-panel rounded-3xl p-8">
              <p className="text-sm text-slate-600">
                {company.name} nasce per semplificare le scelte dei clienti in un
                mercato complesso, concentrandosi su telefonia, energia elettrica e
                gas. Il nostro valore è mettere ordine, chiarire le opzioni e
                guidare la decisione migliore.
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Ogni progetto parte dall’ascolto e si traduce in soluzioni
                personalizzate, con un supporto costante prima e dopo l’attivazione.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-6 md:grid-cols-3">
            {[
              "Consulenza trasparente",
              "Supporto operativo",
              "Innovazione continua",
            ].map((item) => (
              <div key={item} className="lux-card rounded-2xl p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Valore
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{item}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Mettiamo al centro risultati concreti e assistenza continua.
                </p>
              </div>
            ))}
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div className="lux-panel rounded-3xl p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                Il nostro percorso
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                Una crescita costruita sulla fiducia
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Dall’apertura a Castellammare di Stabia abbiamo consolidato una
                rete di partner affidabili per offrire soluzioni efficaci e
                sostenibili.
              </p>
            </div>
            <div className="grid gap-4">
              {values.map((value) => (
                <div key={value.title} className="lux-card rounded-2xl p-6">
                  <p className="text-base font-semibold text-slate-900">{value.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Anno di apertura", value: "2016" },
              { label: "Aree coperte", value: "Telefonia, Energia, Digitale" },
              { label: "Approccio", value: "Consulenziale" },
            ].map((item) => (
              <div key={item.label} className="lux-card rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </Container>
        </section>
      </div>
    </div>
  );
}
