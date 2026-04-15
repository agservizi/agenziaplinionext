import Link from "next/link";
import ClientAreaInteractiveHero from "@/components/ClientAreaInteractiveHero";
import Container from "@/components/Container";
import HomeSeasonalHero from "@/components/HomeSeasonalHero";
import { values } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import HomeServicesGrid from "@/components/HomeServicesGrid";
import Reveal from "@/components/ui/Reveal";
import { StaggerContainer, StaggerItem } from "@/components/ui/Stagger";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import HomeReviews from "@/components/HomeReviews";
import MarqueeStrip from "@/components/ui/MarqueeStrip";

export default function Home() {
  return (
    <div>
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <HomeSeasonalHero />
      <MarqueeStrip />

      {/* ══════════════════════════════════════
          SERVIZI — dark
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
        {/* Decorative bg text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-0 select-none text-[18rem] font-black leading-none text-white/2.5 md:text-[26rem]"
        >
          30+
        </div>
        {/* Orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-[60px] md:blur-[120px]" />
          <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[50px] md:blur-[100px]" />
        </div>

        <Container className="relative">
          <Reveal className="mb-14 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              I nostri servizi
            </span>
            <h2 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
              Tutto quello
              <br />
              che cerchi.
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Da noi.
              </span>
            </h2>
            <p className="max-w-xl text-lg text-slate-400">
              Pagamenti, telefonia, energia, logistica, SPID, PEC e siti web.
              Un unico punto, zero call center.
            </p>
          </Reveal>

          <HomeServicesGrid />

          <Reveal delay={0.1}>
            <div className="mt-12 text-center">
              <Link
                href="/servizi"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Esplora tutti i servizi
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          COME LAVORIAMO — white
      ══════════════════════════════════════ */}
      <section className="bg-white py-24">
        <Container>
          <Reveal className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Come lavoriamo
              </p>
              <h2 className="text-4xl font-black leading-none tracking-tight text-slate-900 md:text-6xl">
                Tre passi.
                <br />
                Nessuna sorpresa.
              </h2>
            </div>
            <p className="max-w-sm text-slate-500">
              Un processo lineare, tempi chiari e un consulente reale dall'inizio alla fine.
            </p>
          </Reveal>

          <StaggerContainer className="grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Analizziamo",
                desc: "Raccogliamo dati, obiettivi e consumi. Fotografia precisa della situazione, senza giri di parole.",
                color: "text-cyan-600 bg-cyan-50 border-cyan-100",
              },
              {
                n: "02",
                title: "Proponiamo",
                desc: "Confronto tra soluzioni disponibili, preventivo chiaro. Nessuna pressione, scelta guidata.",
                color: "text-violet-600 bg-violet-50 border-violet-100",
              },
              {
                n: "03",
                title: "Supportiamo",
                desc: "Assistenza post-attivazione dedicata. Se c'è un problema, lo risolviamo. Stesso numero, stessa persona.",
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
              },
            ].map((step) => (
              <StaggerItem key={step.n}>
                <div className={`group relative h-full overflow-hidden rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${step.color}`}>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-current to-current opacity-30 transition-transform duration-500 group-hover:scale-x-100" />
                  <p className="text-7xl font-black leading-none opacity-10">{step.n}</p>
                  <h3 className="mt-4 text-xl font-black text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          PERCHÉ NOI — dark
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[65px] md:blur-[130px]" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[60px] md:blur-[120px]" />
        </div>

        <Container className="relative">
          <Reveal className="mb-16 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Perché AG SERVIZI
            </p>
            <h2 className="text-4xl font-black leading-none tracking-tight text-white md:text-6xl">
              Un partner vero.
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Dal 2016.
              </span>
            </h2>
          </Reveal>

          <StaggerContainer className="grid gap-4 md:grid-cols-3">
            {values.map((val, i) => {
              const icons = [
                <svg key="s" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                <svg key="z" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M13 2L5 14h6l-1 8 9-14h-6l0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
                <svg key="u" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="19" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M22 21v-1.5a3 3 0 00-2.5-2.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
              ];
              const colors = [
                { icon: "text-emerald-400 bg-emerald-400/10", line: "from-emerald-500 to-teal-500" },
                { icon: "text-amber-400 bg-amber-400/10", line: "from-amber-500 to-orange-500" },
                { icon: "text-blue-400 bg-blue-400/10", line: "from-blue-500 to-indigo-500" },
              ];
              const c = colors[i];
              return (
                <StaggerItem key={val.title}>
                  <div className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition duration-300 hover:border-cyan-400/40 hover:bg-white/8">
                    <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-cyan-500 to-teal-500 transition-transform duration-500 group-hover:scale-x-100" />
                    <div className={`mb-5 inline-flex rounded-2xl p-3 ${c.icon}`}>
                      {icons[i]}
                    </div>
                    <h3 className="text-xl font-black text-white">{val.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{val.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Stats row */}
          <Reveal delay={0.2}>
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 md:grid-cols-4">
              {[
                { label: "Attivi dal", value: "2016" },
                { label: "Servizi gestiti", value: "30+" },
                { label: "Clienti attivi", value: "500+" },
                { label: "Recensioni Google", value: "5★" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center gap-2 bg-slate-950 px-6 py-10">
                  <p className="text-4xl font-black text-white md:text-5xl">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          RECENSIONI — white
      ══════════════════════════════════════ */}
      <section className="bg-white">
        <Container className="py-6">
          <Reveal className="mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Cosa dicono di noi
            </p>
            <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Parla chi ha provato.
            </h2>
          </Reveal>
        </Container>
        <HomeReviews />
      </section>

      {/* ══════════════════════════════════════
          AREA CLIENTI
      ══════════════════════════════════════ */}
      <ClientAreaInteractiveHero />

      {/* ══════════════════════════════════════
          CTA FINALE — dark
      ══════════════════════════════════════ */}
      <section className="bg-slate-950 pb-24 pt-8">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-center text-white shadow-2xl md:p-20">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Pronto a iniziare?
                </p>
                <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
                  Vieni da noi.
                  <br />
                  <span className="text-cyan-400">Risolviamo insieme.</span>
                </h2>
                <p className="mx-auto max-w-md text-slate-400">
                  Consulenza gratuita, senza impegno. Portaci il problema e troviamo la soluzione.
                  Dal 2016, ogni giorno.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <Link
                    href="/contatti"
                    className="rounded-full bg-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:bg-cyan-400"
                  >
                    Parla con noi
                  </Link>
                  <Link
                    href="/servizi"
                    className="rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Vedi i servizi
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
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
