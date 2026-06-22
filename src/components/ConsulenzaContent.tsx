"use client";

import { useRef, Suspense } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Container from "@/components/Container";
import InteractiveConsultingWizard from "@/components/InteractiveConsultingWizard";
import { getYearsActive } from "@/lib/site-data";

/* ─── Shared ease ───────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Animation wrappers ────────────────────────────────────────────── */
function TextReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  return (
    <div ref={ref} className={`overflow-hidden pb-4 ${className}`}>
      <motion.div
        initial={reduced ? false : { y: "110%" }}
        animate={isInView || reduced ? { y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      animate={isInView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScaleCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
      animate={
        isInView || reduced ? { opacity: 1, y: 0, scale: 1 } : undefined
      }
      transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Constants ────────────────────────────────────────────────────── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

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
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO - Video background
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-dvh overflow-hidden bg-black">
        {/* Video background with parallax */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ y: reduced ? 0 : videoY }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="h-[120%] w-full object-cover"
            style={{ opacity: 0.35 }}
          >
            <source
              src="https://assets.mixkit.co/videos/46675/46675-720.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="orb-float-1 absolute -left-40 top-1/4 h-[350px] w-[350px] rounded-full bg-[#5E0ED7]/20 opacity-20 blur-[120px]" />
          <div className="orb-float-2 absolute -right-24 bottom-1/3 h-[280px] w-[280px] rounded-full bg-[#22d3ee]/15 opacity-15 blur-[100px]" />
        </div>

        {/* Header spacer */}
        <div className="shrink-0 pt-24 sm:pt-28 md:pt-32" />

        {/* Hero content */}
        <motion.div
          className="relative flex min-h-[60vh] flex-col justify-end px-6 pb-16 sm:pb-20 md:px-14 md:pb-24"
          style={
            reduced ? undefined : { opacity: contentOpacity, y: contentY }
          }
        >
          <Container>
            <div className="max-w-3xl space-y-8">
              {/* Badge */}
              <FadeUp>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E0ED7]" />
                  Consulenza interattiva
                </span>
              </FadeUp>

              {/* Heading */}
              <div className="mt-8">
                <TextReveal>
                  <h1
                    className="text-white"
                    style={{
                      fontSize: "clamp(2.5rem, 7vw, 5rem)",
                      lineHeight: 0.92,
                      fontWeight: 900,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Consulenza
                  </h1>
                </TextReveal>
                <FadeUp delay={0.1}>
                  <span style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 1.2, fontWeight: 900, letterSpacing: "-0.02em" }}>
                    <span className="text-white">Su </span>
                    <span
                      className="inline-block"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                        backgroundSize: "300% 100%",
                        animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Misura.
                    </span>
                  </span>
                </FadeUp>
              </div>

              {/* Description */}
              <FadeUp delay={0.2}>
                <p
                  className="max-w-lg text-lg"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Costruiamo la consulenza migliore per il tuo servizio. Al
                  termine ricevi conferma email con codice pratica.
                </p>
              </FadeUp>

              {/* CTA */}
              <FadeUp delay={0.25}>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("consulenza-wizard")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group relative inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_40px_rgba(94,14,215,0.35)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(94,14,215,0.5)] sm:text-base"
                >
                  Inizia Ora
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </FadeUp>

              {/* Stats glass pills */}
              <FadeUp delay={0.3}>
                <div className="flex flex-wrap gap-3">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
                    >
                      <span
                        className="text-xl font-black"
                        style={{ color: "#ffffff" }}
                      >
                        {stat.value}
                      </span>
                      <span
                        className="whitespace-pre-line text-xs font-medium uppercase tracking-[0.15em]"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </Container>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span
              className="text-[11px] font-medium uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Scorri
            </span>
            <motion.svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              style={{ color: "rgba(255,255,255,0.3)" }}
              animate={reduced ? undefined : { y: [0, 8, 0] }}
              transition={reduced ? undefined : {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M12 5v14M5 12l7 7 7-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WIZARD SECTION
      ══════════════════════════════════════ */}
      <div id="consulenza-wizard" className="lux-surface">
        <section className="py-16 md:py-24">
          <Container>
            {/* Section header */}
            <div className="mb-12 max-w-2xl">
              <FadeUp>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "#5E0ED7" }}
                >
                  Consulenza guidata
                </p>
              </FadeUp>
              <TextReveal className="mt-4">
                <h2
                  className="text-slate-900"
                  style={{
                    fontSize: "clamp(1.8rem, 4vw, 3rem)",
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Inizia il tuo percorso.
                </h2>
              </TextReveal>
              <FadeUp delay={0.1}>
                <p
                  className="mt-4 max-w-lg text-base"
                  style={{ color: "#64748b" }}
                >
                  Seleziona il servizio di cui hai bisogno, compila i dati
                  richiesti e ricevi il tuo codice pratica direttamente via
                  email.
                </p>
              </FadeUp>
            </div>

            {/* Wizard */}
            <ScaleCard>
              <Suspense
                fallback={
                  <div className="rounded-3xl border border-slate-200 bg-white p-7">
                    Caricamento...
                  </div>
                }
              >
                <InteractiveConsultingWizard />
              </Suspense>
            </ScaleCard>
          </Container>
        </section>
      </div>
    </div>
  );
}
