"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Container from "./Container";
import { values, getYearsActive } from "@/lib/site-data";

/* ─── Shared ease ───────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Animation wrappers (same as HomeContent) ──────────────────────── */
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

const ICON_COLORS = [
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-blue-50", text: "text-blue-600" },
];

/* ─── Main component ────────────────────────────────────────────────── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export default function ChiSiamoContent() {
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
            preload="none"
            poster="/images/chi-siamo-poster.jpg"
            className="h-[120%] w-full object-cover"
            style={{ opacity: 0.35 }}
          >
            <source src="https://assets.mixkit.co/videos/42617/42617-720.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

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

        <div className="shrink-0 pt-24 sm:pt-28 md:pt-32" />

        <motion.div
          className="relative flex min-h-[60vh] flex-col justify-end px-6 pb-16 sm:pb-20 md:px-14 md:pb-24"
          style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        >
        <Container>
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E0ED7]" />
              Chi siamo
            </span>
          </FadeUp>

          <div className="mt-8">
            <TextReveal>
              <h1
                className="text-white"
                style={{
                  fontSize: "clamp(3rem, 8vw, 7rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Dal 2016,
              </h1>
            </TextReveal>
            <FadeUp delay={0.1}>
              <span
                className="inline-block"
                style={{
                  fontSize: "clamp(3rem, 8vw, 7rem)",
                  lineHeight: 1.2,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                siamo ancora qui.
              </span>
            </FadeUp>
          </div>

          <FadeUp delay={0.25}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/50">
              Dal 2016 al tuo fianco, ogni giorno. Nella nostra agenzia trovi
              le giuste persone che risolvono i veri problemi.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="group inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                style={{ color: "#ffffff" }}
              >
                Vieni a trovarci
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                  <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 bg-white/10 px-9 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                Vedi i servizi
              </Link>
            </div>
          </FadeUp>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: `${getYearsActive()}+`, label: "Anni aperti" },
              { value: "500+", label: "Clienti attivi" },
              { value: "30+", label: "Servizi offerti" },
              { value: "5★", label: "su Google" },
            ].map((stat, i) => (
              <ScaleCard key={stat.label} delay={0.2 + i * 0.08}>
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-sm">
                  <p className="text-4xl font-black text-white md:text-5xl">{stat.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                    {stat.label}
                  </p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 sm:bottom-8"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30">
              Scorri
            </span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path d="M7 3v14M2 12l5 5 5-5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          CHI SIAMO DAVVERO
      ══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-24 md:py-32">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Statement card */}
            <ScaleCard>
              <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-10 text-white">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-6 select-none text-[10rem] font-black leading-none text-white/4"
                >
                  AG
                </div>
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-12 top-0 h-56 w-56 rounded-full bg-[#5E0ED7]/20 blur-[80px]" />
                </div>
                <div className="relative space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5E0ED7]">
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
            </ScaleCard>

            {/* 4 reasons grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "01", title: "SPID in 20 min", desc: "Non in tre settimane.", color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
                { n: "02", title: "Rispondiamo noi", desc: "Non un bot, non un menu vocale.", color: "text-violet-600 bg-violet-50 border-violet-100" },
                { n: "03", title: "Via Plinio 72", desc: "Puoi venire quando vuoi.", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { n: "04", title: "Sempre gratis", desc: "Consulenza senza impegno.", color: "text-amber-600 bg-amber-50 border-amber-100" },
              ].map((item, i) => (
                <ScaleCard key={item.n} delay={0.1 + i * 0.1}>
                  <div className={`group h-full rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.color}`}>
                    <p className="text-3xl font-black opacity-20">{item.n}</p>
                    <p className="mt-3 text-base font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
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
      <section className="lux-surface relative overflow-hidden py-24 md:py-32">
        <Container className="relative">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <FadeUp>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                  Come lavoriamo
                </p>
              </FadeUp>
              <TextReveal>
                <h2
                  className="text-slate-900"
                  style={{
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    lineHeight: 0.92,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Tre cose.
                </h2>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h2
                  className="text-slate-900"
                  style={{
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    lineHeight: 0.92,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ogni giorno.
                </h2>
              </TextReveal>
            </div>
            <FadeUp delay={0.3}>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500 md:text-base">
                Non valori aziendali da cornice. Cose concrete che succedono ogni giorno
                in questa agenzia.
              </p>
            </FadeUp>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map((val, i) => (
              <ScaleCard key={val.title} delay={0.1 + i * 0.12}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#5E0ED7]/20 hover:shadow-xl">
                  <div className="h-[2px] absolute inset-x-0 top-0 w-full rounded-t-2xl bg-linear-to-r from-[#5E0ED7] via-purple-400 to-[#22d3ee] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className={`mb-5 inline-flex rounded-xl p-3 ${ICON_COLORS[i].bg} ${ICON_COLORS[i].text}`}>
                    {VALUE_ICONS[i]}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{val.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{val.description}</p>
                  {/* Bottom line reveal */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-[#5E0ED7] to-[#22d3ee] transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          TIMELINE
      ══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-24 md:py-32">
        <Container>
          <div className="mb-16">
            <FadeUp>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Come siamo arrivati fin qui
              </p>
            </FadeUp>
            <TextReveal>
              <h2
                className="text-slate-900"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                {getYearsActive()} anni.
              </h2>
            </TextReveal>
            <TextReveal delay={0.1}>
              <h2
                className="text-slate-900"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Faccia a faccia.
              </h2>
            </TextReveal>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connecting line */}
              <GradientDraw
                delay={0.2}
                className="absolute left-0 right-0 -top-px h-px bg-linear-to-r from-[#5E0ED7]/20 to-[#22d3ee]/20"
              />

              <div className="grid grid-cols-4 gap-8">
                {timeline.map((item, i) => (
                  <ScaleCard key={item.year} delay={0.15 + i * 0.12}>
                    <div className="relative pt-8">
                      {/* Dot */}
                      <div
                        className="absolute top-0 left-0 h-6 w-6 -translate-y-3 rounded-full border-2 border-white shadow-lg"
                        style={{
                          background: i === 0 ? "#5E0ED7" : `linear-gradient(135deg, #5E0ED7, #22d3ee)`,
                          boxShadow: i === 0 ? "0 4px 14px rgba(94,14,215,0.4)" : "0 4px 14px rgba(34,211,238,0.3)",
                        }}
                      />
                      <p className="text-2xl font-black text-[#5E0ED7]">{item.year}</p>
                      <p className="mt-2 text-base font-black text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
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
                <div className="relative border-l-2 border-slate-200 pb-10 pl-8 last:border-transparent last:pb-0">
                  <div
                    className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-white shadow-md"
                    style={{
                      background: i === 0 ? "#5E0ED7" : `linear-gradient(135deg, #5E0ED7, #22d3ee)`,
                      boxShadow: i === 0 ? "0 4px 10px rgba(94,14,215,0.4)" : "0 4px 10px rgba(34,211,238,0.3)",
                    }}
                  />
                  <p className="text-xl font-black text-[#5E0ED7]">{item.year}</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#5E0ED7]/5 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#22d3ee]/4 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <FadeUp>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Hai 5 minuti?
              </p>
            </FadeUp>

            <TextReveal delay={0.1} className="mt-6">
              <h2
                className="text-slate-900"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                  lineHeight: 0.88,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Te lo spieghiamo tutto.
              </h2>
            </TextReveal>
            <TextReveal delay={0.2}>
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                  lineHeight: 0.88,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gratis.
              </span>
            </TextReveal>

            <FadeUp delay={0.35}>
              <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-slate-500">
                Consulenza senza impegno. Vieni in agenzia o scrivici su WhatsApp.
                Rispondiamo entro l&apos;ora.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contatti"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#5E0ED7] px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                  style={{ color: "#ffffff" }}
                >
                  Scrivici ora
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                    <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/servizi"
                  className="rounded-full border border-slate-200 bg-white px-9 py-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:border-[#5E0ED7]/30 hover:shadow-md"
                  style={{ color: "#0f172a" }}
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
