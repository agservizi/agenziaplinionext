"use client";

import { useState, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Container from "@/components/Container";
import PublicBookingDrawer from "@/components/PublicBookingDrawer";
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

/* ─── Constants ─────────────────────────────────────────────────────── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const steps = [
  {
    num: "1",
    title: "Seleziona servizio",
    description: "Scegli il tipo di consulenza o pratica.",
  },
  {
    num: "2",
    title: "Scegli slot",
    description: "Visualizzi solo gli orari realmente disponibili.",
  },
  {
    num: "3",
    title: "Conferma",
    description: "Inserisci dati e ricevi conferma immediata.",
  },
];

/* ─── Main component ────────────────────────────────────────────────── */
export default function PrenotaContent() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-dvh overflow-hidden bg-black"
      >
        {/* Video background */}
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
            poster="/images/prenota-poster.jpg"
            className="h-[120%] w-full object-cover"
            style={{ opacity: 0.35 }}
          >
            <source
              src="https://assets.mixkit.co/videos/21826/21826-720.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/70" />

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

        <motion.div
          className="relative flex min-h-[60vh] flex-col justify-end px-6 pb-16 sm:pb-20 md:px-14 md:pb-24"
          style={
            reduced ? undefined : { opacity: contentOpacity, y: contentY }
          }
        >
          <Container>
            {/* Badge */}
            <FadeUp>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E0ED7]" />
                Prenotazioni
              </span>
            </FadeUp>

            {/* Heading */}
            <div className="mt-8">
              <TextReveal>
                <h1
                  style={{
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    lineHeight: 0.92,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                  }}
                >
                  Prenota
                </h1>
              </TextReveal>
              <FadeUp delay={0.1}>
                <span style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 1.2, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  <span style={{ color: "#ffffff" }}>Il Tuo </span>
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
                    Posto.
                  </span>
                </span>
              </FadeUp>
            </div>

            {/* Description */}
            <FadeUp delay={0.3}>
              <p
                className="mt-6 max-w-xl text-lg leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Prenota il tuo appuntamento in pochi secondi. La conferma
                avviene direttamente sul calendario operativo.
              </p>
            </FadeUp>

            {/* CTA */}
            <FadeUp delay={0.4}>
              <div className="mt-8">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="group inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                  style={{ color: "#ffffff", minHeight: "44px" }}
                >
                  Prenota Ora
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                  >
                    <path
                      d="M4.5 10h11M10.5 5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </FadeUp>

            {/* Stats glass pills */}
            <FadeUp delay={0.5}>
              <div className="mt-16 flex flex-wrap gap-3">
                {[
                  { value: "3", label: "Passi semplici" },
                  { value: "500+", label: "Appuntamenti gestiti" },
                  {
                    value: `${getYearsActive()}+`,
                    label: "Anni attività",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
                  >
                    <span
                      className="text-lg font-black"
                      style={{ color: "#5E0ED7" }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </FadeUp>
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
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-24 sm:py-32">
        {/* Subtle orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#5E0ED7]/5 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#22d3ee]/4 blur-[100px]" />
        </div>

        <Container className="relative">
          {/* Section label */}
          <FadeUp>
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#5E0ED7" }}
            >
              Come funziona
            </span>
          </FadeUp>

          {/* Section heading */}
          <div className="mt-4">
            <TextReveal>
              <h2
                className="text-slate-900"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Tre passi. Nessuna attesa.
              </h2>
            </TextReveal>
          </div>

          {/* Cards grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <ScaleCard key={step.num} delay={i * 0.1}>
                <article className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#5E0ED7]/20 hover:shadow-xl">
                  {/* Gradient top border on hover */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-[#5E0ED7] to-[#22d3ee] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Step number watermark */}
                  <span
                    className="pointer-events-none absolute right-4 top-2 select-none text-[5rem] font-black leading-none"
                    style={{ color: "rgba(94, 14, 215, 0.07)" }}
                  >
                    {step.num}
                  </span>

                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-lg font-bold text-slate-900">
                      {step.num}. {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </article>
              </ScaleCard>
            ))}
          </div>

          {/* CTA below cards */}
          <FadeUp delay={0.3}>
            <div className="mt-12 text-center">
              <button
                onClick={() => setBookingOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                style={{ color: "#ffffff", minHeight: "44px" }}
              >
                Prenota un appuntamento
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                >
                  <path
                    d="M4.5 10h11M10.5 5l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          BOOKING DRAWER
      ══════════════════════════════════════ */}
      <PublicBookingDrawer
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
