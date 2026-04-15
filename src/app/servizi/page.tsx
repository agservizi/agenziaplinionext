import Link from "next/link";
import Container from "@/components/Container";
import ServiziFilterGrid from "@/components/ServiziFilterGrid";
import { buildMetadata } from "@/lib/seo";
import Reveal from "@/components/ui/Reveal";
import { StaggerContainer, StaggerItem } from "@/components/ui/Stagger";

export function generateMetadata() {
  return buildMetadata({
    title: "Servizi a Castellammare di Stabia",
    description:
      "Telefonia, energia, SPID, PEC, spedizioni, CAF, pagamenti e web agency. Tutto da AG SERVIZI a Castellammare di Stabia.",
    path: "/servizi",
  });
}

const quickServices = [
  { icon: "💳", name: "Pagamenti", time: "5 min" },
  { icon: "📱", name: "Telefonia", time: "stesso giorno" },
  { icon: "⚡", name: "Energia", time: "2–5 gg" },
  { icon: "📦", name: "Spedizioni", time: "ritiro oggi" },
  { icon: "🔐", name: "SPID", time: "20 min" },
  { icon: "📄", name: "PEC", time: "30 min" },
  { icon: "🌐", name: "Siti web", time: "21 giorni" },
  { icon: "📑", name: "CAF", time: "su appuntamento" },
];

export default function ServiziPage() {
  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden bg-slate-950 pb-24 pt-40 text-white">
        {/* Decorative bg text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-0 select-none text-[22rem] font-black leading-none text-white/2.5 md:text-[30rem]"
        >
          30+
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <Container className="relative">
          <Reveal className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              I nostri servizi
            </span>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-8xl">
              Hai bisogno
              <br />
              di qualcosa?
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Probabilmente lo facciamo.
              </span>
            </h1>

            <p className="max-w-xl text-lg text-slate-300">
              Telefonia, energia, SPID, PEC, spedizioni, CAF e molto altro.
              Tutto da noi, con chi sa cosa fa.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                Parla con noi
              </Link>
              <Link
                href="/chi-siamo"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Chi siamo
              </Link>
            </div>
          </Reveal>

          {/* Quick services row */}
          <Reveal delay={0.2}>
            <div className="mt-16 overflow-x-auto pb-2">
              <div className="flex gap-3 md:flex-wrap">
                {quickServices.map((s) => (
                  <div
                    key={s.name}
                    className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-5 py-3 backdrop-blur-sm"
                  >
                    <span className="text-xl leading-none">{s.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{s.name}</p>
                      <p className="text-xs text-cyan-400">{s.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          FILTRO + GRIGLIA SERVIZI
      ══════════════════════════════════════ */}
      <section className="bg-slate-50 py-20">
        <Container>
          <Reveal className="mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Cosa stai cercando?
            </p>
            <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Filtra per categoria.
            </h2>
            <p className="text-base text-slate-500">
              Clicca su una categoria per vedere solo quei servizi.
            </p>
          </Reveal>
          <ServiziFilterGrid />
        </Container>
      </section>

      {/* ══════════════════════════════════════
          NUMERI — dark band
      ══════════════════════════════════════ */}
      <section className="bg-slate-950 py-20 text-white">
        <Container>
          <StaggerContainer className="grid gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 md:grid-cols-4">
            {[
              { value: "2016", label: "Aperti dal" },
              { value: "30+", label: "Servizi gestiti" },
              { value: "500+", label: "Clienti attivi" },
              { value: "5★", label: "su Google" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="flex flex-col items-center justify-center gap-2 bg-slate-950 px-6 py-12">
                  <p className="text-5xl font-black text-white">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="bg-white py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-center text-white shadow-2xl md:p-16">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Non hai trovato quello che cerchi?
                </p>
                <h2 className="text-3xl font-black text-white md:text-5xl">
                  Chiamaci.
                  <br />
                  <span className="text-cyan-400">Probabilmente lo facciamo lo stesso.</span>
                </h2>
                <p className="mx-auto max-w-md text-slate-400">
                  Se non abbiamo il servizio, ti diciamo dove andare. Senza girarci intorno.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <Link
                    href="/contatti"
                    className="rounded-full bg-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:bg-cyan-400"
                  >
                    Parla con noi
                  </Link>
                  <Link
                    href="/area-clienti"
                    className="rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Area Clienti
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
