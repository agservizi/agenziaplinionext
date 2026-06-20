"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Container from "./Container";
import ServiziFilterGrid from "@/components/ServiziFilterGrid";
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
      animate={isInView || reduced ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── SVG Icons ─────────────────────────────────────────────────────── */
const ServiceIcons = {
  creditCard: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M13 2L5 14h6l-1 8 9-14h-6l0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const stats = [
  { value: `${getYearsActive()}+`, label: "Anni aperti" },
  { value: "30+", label: "Servizi gestiti" },
  { value: "500+", label: "Clienti attivi" },
  { value: "5★", label: "su Google" },
];

/* ─── Main component ────────────────────────────────────────────────── */
export default function ServiziContent() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-dvh overflow-hidden bg-black">
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
            className="h-[120%] w-full object-cover"
            style={{ opacity: 0.35 }}
          >
            <source src="https://assets.mixkit.co/videos/918/918-720.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/70" />

        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }}
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
          style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        >
          <Container>
            {/* Badge */}
            <FadeUp>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E0ED7]" />
                I nostri servizi
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
                  Hai bisogno
                </h1>
              </TextReveal>
              <TextReveal delay={0.1}>
                <span
                  style={{
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    lineHeight: 0.92,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                    display: "block",
                  }}
                >
                  di qualcosa?
                </span>
              </TextReveal>
              <TextReveal delay={0.2}>
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    lineHeight: 0.92,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                    backgroundSize: "300% 100%",
                    animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Probabilmente lo facciamo.
                </span>
              </TextReveal>
            </div>

            {/* Description */}
            <FadeUp delay={0.3}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Telefonia, energia, SPID, PEC, spedizioni, CAF e molto altro.
                Tutto da noi, con chi sa cosa fa.
              </p>
            </FadeUp>

            {/* CTAs */}
            <FadeUp delay={0.4}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contatti"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                  style={{ color: "#ffffff", minHeight: "44px" }}
                >
                  Parla con noi
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                    <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/chi-siamo"
                  className="rounded-full border border-white/20 bg-white/10 px-9 py-4 text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15"
                  style={{ color: "#ffffff", minHeight: "44px" }}
                >
                  Chi siamo
                </Link>
              </div>
            </FadeUp>

            {/* Quick services row */}
            <FadeUp delay={0.5}>
              <div className="mt-16 overflow-x-auto pb-2">
                <div className="flex gap-3 md:flex-wrap">
                  {quickServices.map((s) => (
                    <div
                      key={s.name}
                      className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
                    >
                      <span className="text-white">{s.icon}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>{s.name}</p>
                        <p className="text-xs" style={{ color: "#5E0ED7" }}>{s.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
            <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>
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
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FILTRO + GRIGLIA SERVIZI
      ══════════════════════════════════════ */}
      <section className="lux-surface py-28 md:py-36">
        <Container>
          <FadeUp>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: "#5E0ED7" }}>
              Cosa stai cercando?
            </p>
          </FadeUp>

          <TextReveal delay={0.1} className="mt-6">
            <h2
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                lineHeight: 0.95,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}
            >
              Filtra per categoria.
            </h2>
          </TextReveal>

          <FadeUp delay={0.2}>
            <p className="mt-4 max-w-lg text-base leading-relaxed" style={{ color: "#64748b" }}>
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
      <section className="lux-surface py-20 md:py-28">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <ScaleCard key={stat.label} delay={i * 0.1}>
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-12 shadow-sm">
                  <p
                    className="font-black"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      color: "#0f172a",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#94a3b8" }}>
                    {stat.label}
                  </p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA FINALE
      ══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-28 md:py-36">
        {/* Subtle orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#5E0ED7]/5 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#22d3ee]/4 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <FadeUp>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: "#5E0ED7" }}>
                Non hai trovato quello che cerchi?
              </p>
            </FadeUp>

            <TextReveal delay={0.1} className="mt-6">
              <h2
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#0f172a",
                }}
              >
                Chiamaci.
              </h2>
            </TextReveal>
            <TextReveal delay={0.2}>
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Probabilmente lo facciamo lo stesso.
              </span>
            </TextReveal>

            <FadeUp delay={0.35}>
              <p className="mx-auto mt-7 max-w-md text-base leading-relaxed" style={{ color: "#64748b" }}>
                Se non abbiamo il servizio, ti diciamo dove andare. Senza girarci intorno.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contatti"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                  style={{ color: "#ffffff", minHeight: "44px" }}
                >
                  Parla con noi
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                    <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/area-clienti"
                  className="rounded-full border border-slate-200 bg-white px-9 py-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:border-[#5E0ED7]/30 hover:shadow-md"
                  style={{ color: "#0f172a", minHeight: "44px" }}
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
