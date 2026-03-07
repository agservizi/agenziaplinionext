import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { serviceCategories, values } from "@/lib/site-data";
import { clientAreas } from "@/lib/client-area";
import { buildMetadata } from "@/lib/seo";
import {
  PaymentsIcon,
  PhoneIcon,
  EnergyIcon,
  LogisticsIcon,
  DigitalIcon,
  WebIcon,
} from "@/components/Icons";

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <section className="hero-gradient min-h-screen py-16">
        <Container className="grid min-h-[calc(100vh-64px)] gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
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
          <div className="glass-card rounded-4xl p-8">
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


      {/* ── Sezione 1: I nostri servizi ─────────────────────────── */}
      <div className="lux-surface text-slate-900">
        <section className="py-16 md:py-24">
          <Container className="space-y-10">
            <SectionHeading
              eyebrow="I nostri servizi"
              title="Tutto ciò che serve, in un unico punto"
              description="Pagamenti, telefonia, energia, logistica, servizi digitali e soluzioni web: competenza locale per ogni esigenza."
              tone="dark"
              align="center"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviceCategories.map((cat) => {
                const icons: Record<string, React.FC> = {
                  payments: PaymentsIcon,
                  phone: PhoneIcon,
                  energy: EnergyIcon,
                  logistics: LogisticsIcon,
                  digital: DigitalIcon,
                  web: WebIcon,
                };
                const Icon = icons[cat.icon];
                return (
                  <Link
                    key={cat.id}
                    href={cat.id === "web-agency" ? "/web-agency" : `/servizi#${cat.id}`}
                    className="lux-card group rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-700 ring-1 ring-cyan-500/20 transition group-hover:scale-110">
                        <Icon />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{cat.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{cat.subtitle}</p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-1 text-sm text-slate-600">
                      {cat.items.slice(0, 3).map((item) => (
                        <li key={item.title}>• {item.title}</li>
                      ))}
                      {cat.items.length > 3 && (
                        <li className="font-medium text-cyan-600">
                          + altri {cat.items.length - 3} servizi
                        </li>
                      )}
                    </ul>
                  </Link>
                );
              })}
            </div>
            <div className="text-center">
              <Link
                href="/servizi"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow transition hover:border-cyan-400 hover:text-cyan-700"
              >
                Esplora tutti i servizi →
              </Link>
            </div>
          </Container>
        </section>

        {/* ── Sezione 2: Come lavoriamo ─────────────────────────── */}
        <section className="py-16 md:py-20">
          <Container className="space-y-8">
            <SectionHeading
              eyebrow="Metodo di lavoro"
              title="Tre fasi per una consulenza efficace"
              description="Un processo lineare per decisioni rapide e risultati affidabili."
              tone="dark"
              align="center"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Analisi delle esigenze",
                  description:
                    "Raccolta dati, obiettivi e consumi per costruire una fotografia precisa della situazione.",
                },
                {
                  title: "Proposta ottimizzata",
                  description:
                    "Confronto tra soluzioni disponibili, preventivo chiaro e scelta guidata senza pressioni.",
                },
                {
                  title: "Supporto continuo",
                  description:
                    "Assistenza post-attivazione dedicata, con aggiornamenti e gestione delle criticità.",
                },
              ].map((step, index) => (
                <div key={step.title} className="lux-card rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-base font-semibold text-slate-900">{step.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </div>

      {/* ── Sezione 3: Area Clienti (sfondo scuro per risalto) ── */}
      <section className="hero-gradient bg-slate-950 py-20 md:py-28">
        <Container className="space-y-10">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Area Clienti
            </p>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Gestisci tutto online, senza passare in sede
            </h2>
            <p className="text-base text-slate-300 md:text-lg">
              Un portale dedicato dove puoi inviare richieste, seguire le pratiche e
              ricevere aggiornamenti in tempo reale su spedizioni, visure e servizi
              CAF/patronato.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {clientAreas.map((area) => (
              <div
                key={area.key}
                className="premium-panel group rounded-3xl p-7 transition hover:-translate-y-1"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  {area.eyebrow}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">{area.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{area.subtitle}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  {area.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={area.path}
                  className="mt-6 inline-flex rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {area.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/area-clienti"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
            >
              {"Scopri l'Area Clienti →"}
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Sezione 4: Perché sceglierci ────────────────────────── */}
      <div className="lux-surface text-slate-900">
        <section className="py-16 md:py-24">
          <Container className="space-y-10">
            <SectionHeading
              eyebrow="Perché AG SERVIZI"
              title="Un partner affidabile dal 2016"
              description="Costruiamo fiducia attraverso trasparenza, competenza e presenza costante sul territorio."
              tone="dark"
              align="center"
            />

            <div className="grid gap-5 md:grid-cols-3">
              {values.map((val) => (
                <div
                  key={val.title}
                  className="lux-card rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
                >
                  <p className="text-lg font-semibold text-slate-900">{val.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{val.description}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Attivi dal", value: "2016" },
                { label: "Servizi gestiti", value: "30+" },
                { label: "Supporto", value: "Locale" },
                { label: "Clienti attivi", value: "500+" },
              ].map((stat) => (
                <div key={stat.label} className="lux-card rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-cyan-600">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Sezione 5: CTA finale ──────────────────────────────── */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="lux-panel rounded-3xl p-10 md:p-14">
              <div className="mx-auto max-w-2xl space-y-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Pronto a iniziare
                </p>
                <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                  Porta efficienza e innovazione nei tuoi servizi quotidiani
                </h2>
                <p className="text-base text-slate-600">
                  Affidati ad AG SERVIZI per gestire attivazioni, pagamenti e servizi
                  digitali in modo semplice e professionale. Parla con i nostri
                  consulenti e ricevi una proposta mirata.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link
                    href="/consulenza"
                    className="rounded-full bg-cyan-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                  >
                    Richiedi una consulenza
                  </Link>
                  <Link
                    href="/area-clienti"
                    className="rounded-full border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                  >
                    {"Accedi all'Area Clienti"}
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return buildMetadata({
    title: "AG SERVIZI | Pagamenti, Telefonia, Luce e Gas a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: pagamenti bollettini, SPID, PEC, telefonia, luce e gas. Consulenza professionale dal 2016.",
    path: "/",
  });
}
