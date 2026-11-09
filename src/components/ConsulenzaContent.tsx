"use client";

import { useRef, Suspense } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Container from "@/components/Container";
import InteractiveConsultingWizard from "@/components/InteractiveConsultingWizard";
import { getYearsActive } from "@/lib/site-data";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeUp } from "@/components/motion/FadeUp";

/* ─── Shared ease ───────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const ACCENT = "#5E0ED7";

const heroStats = [
  { value: "500+", label: "Pratiche\nGestite" },
  { value: "30+", label: "Servizi\nDisponibili" },
  { value: `${getYearsActive()}+`, label: "Anni\nEsperienza" },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function ConsulenzaContent() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

  const dur = reduced ? 0.01 : 0.9;
  const headingDelay = (i: number) => (reduced ? 0 : 0.2 + i * 0.12);

  return (
    <div className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      {/* ══════════════════════════════════════
          HERO - Editorial paper / ink
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative grid min-h-dvh overflow-hidden border-b border-[var(--ink)]/10 lg:grid-cols-[48fr_52fr]"
      >
        <motion.div
          className="relative z-10 flex flex-col justify-end bg-[var(--paper)] px-6 pb-14 pt-28 sm:px-10 md:px-12 md:pb-20 md:pt-32"
          style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        >
          <p className="mb-auto text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--ink)]/40 sm:text-xs">
            Consulenza interattiva
          </p>

          <h1 className="display-type m-0 p-0 text-[clamp(2.75rem,8vw,6.5rem)] text-[var(--ink)]">
            {["Consulenza", "Su Misura"].map((word, i) => (
              <span key={word} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: headingDelay(i), duration: dur, ease: EASE }}
                  style={i === 1 ? { color: ACCENT } : undefined}
                >
                  {word}
                  {i === 1 ? "." : ""}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.85, duration: dur * 0.7, ease: EASE }}
            className="mt-6 max-w-md text-sm leading-relaxed text-[var(--ink)]/65 sm:text-base"
          >
            Costruiamo la consulenza migliore per il tuo servizio. Al termine
            ricevi conferma email con codice pratica.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 1.1, duration: dur * 0.6, ease: EASE }}
            className="mt-8"
          >
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("consulenza-wizard")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="brutal-cta-ink inline-flex items-center gap-3 bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#5E0ED7] sm:text-base"
            >
              Inizia Ora
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </motion.div>

        {/* Editorial stats panel */}
        <div className="relative hidden flex-col justify-end border-l border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-10 pb-20 pt-32 lg:flex">
          <p className="mb-auto text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/35">
            In numeri
          </p>
          <div className="flex flex-col gap-10">
            {heroStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.5 + i * 0.12, duration: dur * 0.7, ease: EASE }}
              >
                <p className="display-type text-5xl text-[var(--ink)] md:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-2 whitespace-pre-line text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/55">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile stats */}
        <div className="flex gap-8 border-t border-[var(--ink)]/10 bg-[var(--paper)] px-6 py-8 lg:hidden">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <p className="display-type text-3xl text-[var(--ink)]">{stat.value}</p>
              <p className="mt-1 whitespace-pre-line text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          WIZARD SECTION
      ══════════════════════════════════════ */}
      <div id="consulenza-wizard" className="border-t border-[var(--ink)]/10 bg-[var(--paper)]">
        <section className="py-16 md:py-24">
          <Container>
            <div className="mb-12 max-w-2xl">
              <FadeUp>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40 sm:text-xs">
                  Consulenza guidata
                </p>
              </FadeUp>
              <TextReveal className="mt-4">
                <h2 className="display-type text-[clamp(1.8rem,4vw,3rem)] text-[var(--ink)]">
                  Inizia il tuo percorso.
                </h2>
              </TextReveal>
              <FadeUp delay={0.1}>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--ink)]/65 sm:text-base">
                  Seleziona il servizio di cui hai bisogno, compila i dati
                  richiesti e ricevi il tuo codice pratica direttamente via
                  email.
                </p>
              </FadeUp>
            </div>

            <Suspense
              fallback={
                <div className="border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-7 text-sm text-[var(--ink)]/60">
                  Caricamento...
                </div>
              }
            >
              <InteractiveConsultingWizard />
            </Suspense>
          </Container>
        </section>
      </div>
    </div>
  );
}
