"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Container from "./Container";
import ServiziFilterGrid from "@/components/ServiziFilterGrid";
import { getYearsActive } from "@/lib/site-data";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeUp } from "@/components/motion/FadeUp";
import { ScaleCard } from "@/components/motion/ScaleCard";

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const ACCENT = "#5E0ED7";

/* ─── SVG Icons ─────────────────────────────────────────────────────── */
const ServiceIcons = {
  creditCard: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="7" y="2" width="10" height="20" rx="0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M13 2L5 14h6l-1 8 9-14h-6l0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      <path d="M14 2v6h6M8 13h8M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  ),
};

/* ─── Data ──────────────────────────────────────────────────────────── */
const quickServices = [
  { icon: ServiceIcons.creditCard, name: "Pagamenti", time: "5 min" },
  { icon: ServiceIcons.phone, name: "Telefonia", time: "stesso giorno" },
  { icon: ServiceIcons.lightning, name: "Energia", time: "2-5 gg" },
  { icon: ServiceIcons.package, name: "Spedizioni", time: "ritiro oggi" },
  { icon: ServiceIcons.shield, name: "SPID", time: "20 min" },
  { icon: ServiceIcons.document, name: "PEC", time: "30 min" },
  { icon: ServiceIcons.globe, name: "Siti web", time: "21 giorni" },
  { icon: ServiceIcons.fileText, name: "CAF", time: "su appuntamento" },
];

const stats = [
  { value: `${getYearsActive()}+`, label: "Anni aperti" },
  { value: "30+", label: "Servizi gestiti" },
  { value: "500+", label: "Clienti attivi" },
  { value: "5★", label: "su Google" },
];

const headingLines = ["Hai bisogno", "di qualcosa?", "Probabilmente lo facciamo."] as const;

/* ─── Main component ────────────────────────────────────────────────── */
export default function ServiziContent() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, reduced ? 0 : 40]);

  const dur = reduced ? 0.01 : 0.9;
  const headingDelay = (i: number) => (reduced ? 0 : 0.15 + i * 0.12);

  return (
    <div className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      {/* ══════════════════════════════════════
          HERO — Brutal Editorial paper/ink
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative grid min-h-dvh overflow-hidden border-b border-[var(--ink)]/10 lg:grid-cols-[55fr_45fr]"
      >
        <motion.div
          className="relative z-10 flex flex-col justify-end bg-[var(--paper)] px-6 pb-14 pt-28 sm:px-10 md:px-12 md:pb-20 md:pt-32"
          style={reduced ? undefined : { y: contentY }}
        >
          <p className="mb-auto text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
            I nostri servizi
          </p>

          <h1 className="display-type m-0 mt-10 p-0 text-[clamp(2.5rem,7vw,5.5rem)] text-[var(--ink)]">
            {headingLines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: headingDelay(i), duration: dur, ease: SPRING_EASE }}
                  style={i === headingLines.length - 1 ? { color: ACCENT } : undefined}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.7, duration: dur * 0.7, ease: SPRING_EASE }}
            className="mt-6 max-w-xl text-base leading-relaxed text-[var(--ink)]/65 sm:text-lg"
          >
            Telefonia, energia, SPID, PEC, spedizioni, CAF e molto altro.
            Tutto da noi, con chi sa cosa fa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.9, duration: dur * 0.6, ease: SPRING_EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/contatti"
              className="brutal-cta-ink inline-flex items-center gap-3 bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#5E0ED7]"
              style={{ minHeight: "44px" }}
            >
              Parla con noi
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </Link>
            <Link
              href="/chi-siamo"
              className="inline-flex items-center border border-[var(--ink)]/20 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              style={{ minHeight: "44px" }}
            >
              Chi siamo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 1.05, duration: dur * 0.6, ease: SPRING_EASE }}
            className="mt-12 overflow-x-auto border-t border-[var(--ink)]/10 pt-8"
          >
            <div className="flex gap-0 md:flex-wrap">
              {quickServices.map((s) => (
                <div
                  key={s.name}
                  className="flex shrink-0 items-center gap-3 border border-[var(--ink)]/10 border-r-0 px-4 py-3 last:border-r md:border-r"
                >
                  <span className="text-[var(--ink)]">{s.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-[var(--ink)]">{s.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/40">
                      {s.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Ink contrast panel */}
        <div className="relative hidden min-h-[40vh] bg-[var(--ink)] lg:block">
          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              Catalogo servizi
            </p>
            <div>
              <p className="display-type text-[clamp(3rem,5vw,4.5rem)] leading-none text-white">
                30+
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
                Servizi gestiti in agenzia — dallo sportello digitale alle spedizioni.
              </p>
              <div className="mt-8 h-px w-16 bg-[#5E0ED7]" />
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#22d3ee]/70">
                Castellammare di Stabia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FILTRO + GRIGLIA SERVIZI
      ══════════════════════════════════════ */}
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] py-28 md:py-36">
        <Container>
          <FadeUp>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
              Cosa stai cercando?
            </p>
          </FadeUp>

          <TextReveal delay={0.1} className="mt-6">
            <h2 className="display-type m-0 text-[clamp(2rem,6vw,4rem)] text-[var(--ink)]">
              Filtra per categoria.
            </h2>
          </TextReveal>

          <FadeUp delay={0.2}>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--ink)]/65">
              Clicca su una categoria per vedere solo quei servizi.
            </p>
          </FadeUp>

          <FadeUp delay={0.3} className="mt-12">
            <ServiziFilterGrid />
          </FadeUp>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] py-20 md:py-28">
        <Container>
          <div ref={statsRef} className="grid gap-0 border border-[var(--ink)]/15 sm:grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <ScaleCard key={stat.label} delay={i * 0.1}>
                <div
                  className={`flex flex-col items-start justify-center gap-3 px-6 py-12 ${
                    i < stats.length - 1 ? "border-[var(--ink)]/10 sm:border-r" : ""
                  } ${i < 2 ? "border-b border-[var(--ink)]/10 md:border-b-0" : ""}`}
                >
                  <p
                    className="display-type text-[clamp(2.5rem,5vw,3.5rem)] text-[var(--ink)]"
                    style={{
                      opacity: statsInView || reduced ? 1 : 0,
                      transform: statsInView || reduced ? "none" : "translateY(12px)",
                      transition: reduced ? undefined : `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
                    {stat.label}
                  </p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA FINALE — ink panel
      ══════════════════════════════════════ */}
      <section className="bg-[var(--ink)] py-28 md:py-36">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <FadeUp>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                Non hai trovato quello che cerchi?
              </p>
            </FadeUp>

            <TextReveal delay={0.1} className="mt-6">
              <h2 className="display-type m-0 text-[clamp(2rem,6vw,4rem)] text-white">
                Chiamaci.
              </h2>
            </TextReveal>
            <TextReveal delay={0.2}>
              <span className="display-type block text-[clamp(2rem,6vw,4rem)]" style={{ color: ACCENT }}>
                Probabilmente lo facciamo lo stesso.
              </span>
            </TextReveal>

            <FadeUp delay={0.35}>
              <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-white/55">
                Se non abbiamo il servizio, ti diciamo dove andare. Senza girarci intorno.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  href="/contatti"
                  className="brutal-cta-ink inline-flex items-center gap-3 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:bg-[#5E0ED7] hover:text-white"
                  style={{ minHeight: "44px" }}
                >
                  Parla con noi
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                    <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </Link>
                <Link
                  href="/area-clienti"
                  className="inline-flex items-center border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-[#22d3ee] hover:text-[#22d3ee]"
                  style={{ minHeight: "44px" }}
                >
                  Area Clienti
                </Link>
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>
    </div>
  );
}
