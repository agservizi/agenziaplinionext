import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ServiceCategory from "@/components/ServiceCategory";
import { serviceCategories, values } from "@/lib/site-data";

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <section className="hero-gradient pt-16">
        <Container className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Agenzia di servizi dal 2016
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Consulenze affidabili per telefonia, energia e servizi digitali.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              AG SERVIZI supporta privati e aziende con soluzioni personalizzate,
              rapide e trasparenti, combinando competenza locale e innovazione
              digitale.
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
                <div key={value.title} className="glass-card rounded-2xl p-4">
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
                Ottimizzazione contratti, supporto operativo e soluzioni su
                misura per ridurre tempi di gestione e aumentare la serenità
                operativa.
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Analisi dei consumi e consulenza trasparente.</li>
                <li>• Presenza locale con supporto continuativo.</li>
                <li>• Servizi digitali per aziende e privati.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Servizi in evidenza"
            title="Soluzioni organizzate per area di consulenza"
            description="Ogni servizio è seguito da consulenti specializzati con un approccio su misura."
          />
          <div className="grid gap-8">
            {serviceCategories.slice(0, 3).map((category) => (
              <ServiceCategory key={category.id} category={category} compact />
            ))}
          </div>
          <div>
            <Link
              href="/servizi"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Scopri tutti i servizi →
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900/50 py-16">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <SectionHeading
            eyebrow="Metodo"
            title="Consulenza, gestione e supporto continuo"
            description="Costruiamo percorsi chiari per la scelta delle soluzioni più efficaci."
          />
          <div className="grid gap-4">
            {[
              {
                title: "Ascolto e analisi",
                description: "Valutiamo esigenze, consumi e obiettivi.",
              },
              {
                title: "Proposta personalizzata",
                description: "Selezioniamo la combinazione migliore per te.",
              },
              {
                title: "Assistenza dedicata",
                description: "Supporto costante per ogni necessità post-attivazione.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-5">
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <SectionHeading
            eyebrow="Pronto a iniziare"
            title="Porta efficienza e innovazione nei tuoi servizi quotidiani"
            description="Parla con i nostri consulenti e ricevi una proposta mirata."
          />
          <div className="glass-card rounded-3xl p-8">
            <p className="text-sm text-slate-300">
              Affidati ad AG SERVIZI per gestire attivazioni, pagamenti e servizi
              digitali in modo semplice e professionale.
            </p>
            <Link
              href="/contatti"
              className="mt-6 inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Richiedi una consulenza
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
