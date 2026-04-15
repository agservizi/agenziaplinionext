import Link from "next/link";
import Container from "@/components/Container";
import { values } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import Reveal from "@/components/ui/Reveal";
import { StaggerContainer, StaggerItem } from "@/components/ui/Stagger";

export function generateMetadata() {
  return buildMetadata({
    title: "Chi siamo | AG SERVIZI Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia dal 2016. Persone vere, risposte rapide, niente call center.",
    path: "/chi-siamo",
  });
}

const timeline = [
  { year: "2016", title: "Si apre.", desc: "Via Plinio 72. Primo giorno, prime pratiche, primi clienti che tornano." },
  { year: "2019", title: "Cresciamo.", desc: "Telefonia, energia, pagamenti. Il passaparola batte qualsiasi pubblicità." },
  { year: "2022", title: "Digitalizziamo.", desc: "SPID, PEC, firma digitale, web agency. I clienti chiedono, noi facciamo." },
  { year: "Oggi", title: "Siamo ancora qui.", desc: "500+ clienti attivi, 30+ servizi. Stessa agenzia, stesso numero." },
];

export default function ChiSiamoPage() {
  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO — dark, bold, numero decorativo
      ══════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden bg-slate-950 pb-24 pt-32 text-white">
        {/* Decorative giant number */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 select-none text-[28rem] font-black leading-none text-white/2.5 md:text-[36rem]"
        >
          9
        </div>
        {/* Orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute right-20 bottom-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>

        <Container className="relative">
          <Reveal className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Chi siamo
            </span>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-8xl">
              Dal 2016,
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                siamo ancora qui.
              </span>
            </h1>

            <p className="max-w-xl text-lg text-slate-300">
              Niente call center, niente attese. A Castellammare di Stabia trovi
              persone vere che risolvono problemi veri.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                Vieni a trovarci
              </Link>
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Vedi i servizi
              </Link>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal delay={0.2}>
            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 md:grid-cols-4">
              {[
                { value: "9+", label: "Anni aperti" },
                { value: "500+", label: "Clienti attivi" },
                { value: "30+", label: "Servizi offerti" },
                { value: "5★", label: "su Google" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center gap-1 bg-slate-950 px-6 py-8"
                >
                  <p className="text-4xl font-black text-white md:text-5xl">{stat.value}</p>
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
          CHI SIAMO DAVVERO — split layout
      ══════════════════════════════════════ */}
      <section className="bg-white py-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Statement card */}
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-10 text-white">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-6 select-none text-[10rem] font-black leading-none text-white/4"
                >
                  AG
                </div>
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-12 top-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-[80px]" />
                </div>
                <div className="relative space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    La nostra storia
                  </p>
                  <h2 className="text-3xl font-black leading-tight md:text-4xl">
                    Non siamo una catena.
                    <br />
                    Siamo qui.
                  </h2>
                  <p className="text-base text-slate-300">
                    Apriamo alle 8:45, chiudiamo alle 19:00. Nel mezzo risolviamo
                    bollette, attiviamo contratti, facciamo SPID, spediamo pacchi e
                    costruiamo siti web. Dal 1 giugno 2016, ogni giorno.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Castellammare di Stabia", "Dal 2016", "Risposta in giornata"].map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 4 reasons grid */}
            <StaggerContainer className="grid grid-cols-2 gap-4">
              {[
                { n: "01", title: "SPID in 20 min", desc: "Non in tre settimane.", color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
                { n: "02", title: "Rispondiamo noi", desc: "Non un bot, non un menu vocale.", color: "text-violet-600 bg-violet-50 border-violet-100" },
                { n: "03", title: "Via Plinio 72", desc: "Puoi venire quando vuoi.", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { n: "04", title: "Sempre gratis", desc: "Consulenza senza impegno.", color: "text-amber-600 bg-amber-50 border-amber-100" },
              ].map((item) => (
                <StaggerItem key={item.n}>
                  <div className={`group h-full rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${item.color}`}>
                    <p className="text-3xl font-black opacity-20">{item.n}</p>
                    <p className="mt-3 text-base font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          COME LAVORIAMO — dark, numbered cards
      ══════════════════════════════════════ */}
      <section className="bg-slate-950 py-24 text-white">
        <Container>
          <Reveal className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Come lavoriamo
              </p>
              <h2 className="text-4xl font-black leading-none tracking-tight md:text-7xl">
                Tre cose.
                <br />
                Ogni giorno.
              </h2>
            </div>
            <p className="max-w-sm text-slate-400">
              Non valori aziendali da cornice. Cose concrete che succedono ogni giorno
              in questa agenzia.
            </p>
          </Reveal>

          <StaggerContainer className="grid gap-4 md:grid-cols-3">
            {values.map((value, i) => (
              <StaggerItem key={value.title}>
                <div className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition duration-300 hover:border-cyan-400/40 hover:bg-white/8">
                  {/* Bottom line reveal */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-cyan-500 to-teal-500 transition-transform duration-500 group-hover:scale-x-100" />
                  <p className="text-8xl font-black leading-none text-white/5 transition-colors group-hover:text-white/10">
                    0{i + 1}
                  </p>
                  <h3 className="mt-4 text-xl font-black text-white">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{value.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          TIMELINE — horizontal desktop
      ══════════════════════════════════════ */}
      <section className="bg-white py-24">
        <Container>
          <Reveal className="mb-16 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Come siamo arrivati fin qui
            </p>
            <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              9 anni.
              <br />
              Faccia a faccia.
            </h2>
          </Reveal>

          {/* Desktop timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-3 h-px bg-slate-200" />
              <StaggerContainer className="grid grid-cols-4 gap-8">
                {timeline.map((item) => (
                  <StaggerItem key={item.year}>
                    <div className="relative pt-8">
                      {/* Dot */}
                      <div className="absolute top-0 left-0 h-6 w-6 -translate-y-3 rounded-full border-2 border-white bg-cyan-500 shadow-lg shadow-cyan-500/40" />
                      <p className="text-2xl font-black text-cyan-600">{item.year}</p>
                      <p className="mt-2 text-base font-black text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>

          {/* Mobile timeline */}
          <StaggerContainer className="space-y-0 md:hidden">
            {timeline.map((item, i) => (
              <StaggerItem key={item.year}>
                <div className="relative border-l-2 border-slate-200 pb-10 pl-8 last:border-transparent last:pb-0">
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-white bg-cyan-500 shadow-md shadow-cyan-500/40" />
                  <p className="text-xl font-black text-cyan-600">{item.year}</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA FINALE — full dark banner
      ══════════════════════════════════════ */}
      <section className="bg-slate-950 py-8 pb-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-center text-white shadow-2xl md:p-20">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Hai 5 minuti?
                </p>
                <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
                  Te lo spieghiamo tutto.
                  <br />
                  <span className="text-cyan-400">Gratis.</span>
                </h2>
                <p className="mx-auto max-w-md text-slate-400">
                  Consulenza senza impegno. Vieni in agenzia o scrivici su WhatsApp.
                  Rispondiamo entro l&apos;ora.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/contatti"
                    className="rounded-full bg-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:bg-cyan-400"
                  >
                    Scrivici ora
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
