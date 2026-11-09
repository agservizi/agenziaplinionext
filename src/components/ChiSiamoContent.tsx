"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Container from "./Container";
import { values, getYearsActive } from "@/lib/site-data";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeUp } from "@/components/motion/FadeUp";
import { ScaleCard } from "@/components/motion/ScaleCard";

/* ─── Shared ease ───────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GradientDraw({ delay = 0, className = "" }: { delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { scaleX: 0 }}
      animate={isInView || reduced ? { scaleX: 1 } : undefined}
      transition={{ duration: 1.4, ease: EASE, delay }}
      className={`origin-left ${className}`}
    />
  );
}

/* ─── Data ──────────────────────────────────────────────────────────── */
const timeline = [
  { year: "2016", title: "Si apre.", desc: "Via Plinio 72. Primo giorno, prime pratiche, primi clienti che tornano." },
  { year: "2019", title: "Cresciamo.", desc: "Telefonia, energia, pagamenti. Il passaparola batte qualsiasi pubblicità." },
  { year: "2022", title: "Digitalizziamo.", desc: "SPID, PEC, firma digitale, web agency. I clienti chiedono, noi facciamo." },
  { year: "Oggi", title: "Siamo ancora qui.", desc: "500+ clienti attivi, 30+ servizi. Stessa agenzia, stesso numero." },
];

const VALUE_ICONS = [
  <svg key="shield" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="bolt" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M13 2L5 14h6l-1 8 9-14h-6l0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  <svg key="users" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="19" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M22 21v-1.5a3 3 0 00-2.5-2.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
];

/* ─── Main component ────────────────────────────────────────────────── */
export default function ChiSiamoContent() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <div className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      {/* ══════════════════════════════════════
          HERO — brutal editorial (VideoHero)
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative grid min-h-dvh overflow-hidden border-b border-[var(--ink)]/10 lg:grid-cols-[42fr_58fr]"
      >
        <div className="relative z-10 flex flex-col justify-end bg-[var(--paper)] px-6 pb-14 pt-28 sm:px-10 md:px-12 md:pb-20 md:pt-32">
          <FadeUp>
            <p className="mb-auto text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--ink)]/40 sm:text-xs">
              Chi siamo / Dal 2016
            </p>
          </FadeUp>

          <div className="mt-10">
            <TextReveal>
              <h1 className="display-type m-0 p-0 text-[clamp(3rem,9vw,7.5rem)] text-[var(--ink)]">
                Dal 2016,
              </h1>
            </TextReveal>
            <FadeUp delay={0.1}>
              <h1 className="display-type m-0 p-0 text-[clamp(3rem,9vw,7.5rem)] text-[#5E0ED7]">
                siamo ancora qui.
              </h1>
            </FadeUp>
          </div>

          <FadeUp delay={0.25}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--ink)]/65 sm:text-base">
              Dal 2016 al tuo fianco, ogni giorno. Nella nostra agenzia trovi
              le giuste persone che risolvono i veri problemi.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contatti"
                className="brutal-cta-ink group inline-flex items-center gap-3 bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#5E0ED7]"
              >
                Vieni a trovarci
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                  <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/servizi"
                className="inline-flex items-center border border-[var(--ink)]/15 bg-[var(--paper)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Vedi i servizi
              </Link>
            </div>
          </FadeUp>

          {/* Stats — mobile / under copy */}
          <div className="mt-12 flex flex-wrap gap-8 border-t border-[var(--ink)]/10 pt-8 lg:hidden">
            {[
              { value: `${getYearsActive()}+`, label: "Anni aperti" },
              { value: "500+", label: "Clienti attivi" },
              { value: "30+", label: "Servizi offerti" },
              { value: "5★", label: "su Google" },
            ].map((stat, i) => (
              <ScaleCard key={stat.label} delay={0.2 + i * 0.08}>
                <div>
                  <p className="display-type text-3xl text-[var(--ink)]">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/50">
                    {stat.label}
                  </p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </div>

        {/* Video panel — sharp, no glass/orbs */}
        <div className="relative hidden min-h-[52vh] overflow-hidden border-l border-[var(--ink)]/10 lg:block">
          <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : videoY }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="h-[115%] w-full object-cover contrast-[1.02] saturate-[0.92]"
            >
              <source src="https://assets.mixkit.co/videos/42617/42617-720.mp4" type="video/mp4" />
            </video>
          </motion.div>
          <div className="absolute inset-0 bg-linear-to-r from-[var(--paper)] via-[var(--paper)]/25 to-transparent" />
          <div className="absolute inset-0 bg-[var(--ink)]/6" />
          <div className="absolute bottom-10 left-10 flex gap-10 text-[var(--ink)]">
            {[
              { value: `${getYearsActive()}+`, label: "Anni aperti" },
              { value: "500+", label: "Clienti attivi" },
              { value: "30+", label: "Servizi" },
            ].map((stat, i) => (
              <ScaleCard key={stat.label} delay={0.2 + i * 0.08}>
                <div>
                  <p className="display-type text-4xl">{stat.value}</p>
                  <p className="mt-1 whitespace-pre-line text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/55">
                    {stat.label}
                  </p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CHI SIAMO DAVVERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[var(--ink)]/10 bg-[var(--paper)] py-24 md:py-32">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Statement panel */}
            <ScaleCard>
              <div className="relative overflow-hidden border border-[var(--ink)]/10 bg-[var(--ink)] p-10 text-[var(--paper)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -top-4 select-none text-[10rem] font-black leading-none text-[var(--paper)]/5"
                >
                  AG
                </div>
                <div className="relative space-y-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
                    La nostra storia
                  </p>
                  <h2 className="display-type text-3xl leading-tight md:text-4xl">
                    Non siamo una catena.
                    <br />
                    Siamo qui.
                  </h2>
                  <p className="text-base text-[var(--paper)]/70">
                    Apriamo alle 8:45, chiudiamo alle 19:00. Nel mezzo risolviamo
                    bollette, attiviamo contratti, facciamo SPID, spediamo pacchi e
                    costruiamo siti web. Dal 1 giugno 2016, ogni giorno.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Castellammare di Stabia", "Dal 2016", "Risposta in giornata"].map((tag) => (
                      <span
                        key={tag}
                        className="border border-[var(--paper)]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--paper)]/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScaleCard>

            {/* 4 reasons grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "01", title: "SPID in 20 min", desc: "Non in tre settimane." },
                { n: "02", title: "Rispondiamo noi", desc: "Non un bot, non un menu vocale." },
                { n: "03", title: "Via Plinio 72", desc: "Puoi venire quando vuoi." },
                { n: "04", title: "Sempre gratis", desc: "Consulenza senza impegno." },
              ].map((item, i) => (
                <ScaleCard key={item.n} delay={0.1 + i * 0.1}>
                  <div className="group h-full border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-5 transition-colors duration-300 hover:border-[#5E0ED7]/40">
                    <p className="text-3xl font-black text-[var(--ink)]/15">{item.n}</p>
                    <p className="mt-3 text-base font-black text-[var(--ink)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--ink)]/55">{item.desc}</p>
                  </div>
                </ScaleCard>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          COME LAVORIAMO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[var(--ink)]/10 bg-[var(--paper)] py-24 md:py-32">
        <Container className="relative">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <FadeUp>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
                  Come lavoriamo
                </p>
              </FadeUp>
              <TextReveal>
                <h2 className="display-type text-[clamp(2.5rem,7vw,5rem)] text-[var(--ink)]">
                  Tre cose.
                </h2>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h2 className="display-type text-[clamp(2.5rem,7vw,5rem)] text-[var(--ink)]">
                  Ogni giorno.
                </h2>
              </TextReveal>
            </div>
            <FadeUp delay={0.3}>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--ink)]/55 md:text-base">
                Non valori aziendali da cornice. Cose concrete che succedono ogni giorno
                in questa agenzia.
              </p>
            </FadeUp>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map((val, i) => (
              <ScaleCard key={val.title} delay={0.1 + i * 0.12}>
                <div className="group relative h-full border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-8 transition-colors duration-300 hover:border-[#5E0ED7]/40">
                  <div className="mb-5 inline-flex border border-[var(--ink)]/10 p-3 text-[#5E0ED7]">
                    {VALUE_ICONS[i]}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--ink)]">{val.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]/55">{val.description}</p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          TIMELINE
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[var(--ink)]/10 bg-[var(--paper)] py-24 md:py-32">
        <Container>
          <div className="mb-16">
            <FadeUp>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Come siamo arrivati fin qui
              </p>
            </FadeUp>
            <TextReveal>
              <h2 className="display-type text-[clamp(2.5rem,7vw,5rem)] text-[var(--ink)]">
                {getYearsActive()} anni.
              </h2>
            </TextReveal>
            <TextReveal delay={0.1}>
              <h2 className="display-type text-[clamp(2.5rem,7vw,5rem)] text-[var(--ink)]">
                Faccia a faccia.
              </h2>
            </TextReveal>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:block">
            <div className="relative">
              <GradientDraw
                delay={0.2}
                className="absolute left-0 right-0 top-0 h-px bg-[var(--ink)]/15"
              />

              <div className="grid grid-cols-4 gap-8">
                {timeline.map((item, i) => (
                  <ScaleCard key={item.year} delay={0.15 + i * 0.12}>
                    <div className="relative pt-8">
                      {/* Sharp marker */}
                      <div
                        className={`absolute left-0 top-0 h-3 w-3 -translate-y-1.5 border border-[var(--ink)] ${
                          i === 0 ? "bg-[#5E0ED7]" : "bg-[var(--paper)]"
                        }`}
                      />
                      <p className="text-2xl font-black text-[#5E0ED7]">{item.year}</p>
                      <p className="mt-2 text-base font-black text-[var(--ink)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/55">{item.desc}</p>
                    </div>
                  </ScaleCard>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="space-y-0 md:hidden">
            {timeline.map((item, i) => (
              <ScaleCard key={item.year} delay={0.1 + i * 0.1}>
                <div className="relative border-l border-[var(--ink)]/15 pb-10 pl-8 last:border-transparent last:pb-0">
                  <div
                    className={`absolute -left-1.5 top-0 h-3 w-3 border border-[var(--ink)] ${
                      i === 0 ? "bg-[#5E0ED7]" : "bg-[var(--paper)]"
                    }`}
                  />
                  <p className="text-xl font-black text-[#5E0ED7]">{item.year}</p>
                  <p className="mt-1 text-lg font-black text-[var(--ink)]">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]/55">{item.desc}</p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA FINALE
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[var(--paper)] py-28 md:py-36">
        <Container className="relative">
          <div className="mx-auto max-w-3xl border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-8 py-16 text-center sm:px-12">
            <FadeUp>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Hai 5 minuti?
              </p>
            </FadeUp>

            <TextReveal delay={0.1} className="mt-6">
              <h2 className="display-type text-[clamp(2.5rem,8vw,5.5rem)] text-[var(--ink)]">
                Te lo spieghiamo tutto.
              </h2>
            </TextReveal>
            <TextReveal delay={0.2}>
              <h2 className="display-type text-[clamp(2.5rem,8vw,5.5rem)] text-[#5E0ED7]">
                Gratis.
              </h2>
            </TextReveal>

            <FadeUp delay={0.35}>
              <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-[var(--ink)]/55">
                Consulenza senza impegno. Vieni in agenzia o scrivici su WhatsApp.
                Rispondiamo entro l&apos;ora.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  href="/contatti"
                  className="brutal-cta-ink group inline-flex items-center gap-3 bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#5E0ED7]"
                >
                  Scrivici ora
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                    <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/servizi"
                  className="inline-flex items-center border border-[var(--ink)]/15 bg-[var(--paper)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                >
                  Vedi i servizi
                </Link>
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>
    </div>
  );
}
