"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Container from "./Container";
import HomeServicesGrid from "./HomeServicesGrid";
import HomeReviews from "./HomeReviews";
import ClientAreaInteractiveHero from "./ClientAreaInteractiveHero";
import LuggageBookingWidget from "./LuggageBookingWidget";
import { values } from "@/lib/site-data";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

function ScrollCounter({ target, delay = 0 }: { target: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (reduced) { setCount(target); return; }
    const timeout = setTimeout(() => {
      const start = performance.now();
      const dur = 2000;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        setCount(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, target, delay, reduced]);

  return <span ref={ref}>{count}</span>;
}

const VALUE_ICONS = [
  <svg key="s" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="z" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M13 2L5 14h6l-1 8 9-14h-6l0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  <svg key="u" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="19" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M22 21v-1.5a3 3 0 00-2.5-2.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
];

const ICON_COLORS = [
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-blue-50", text: "text-blue-600" },
];

const STEPS = [
  { n: "01", title: "Ascoltiamo", desc: "Ci dici cosa ti serve, guardiamo i numeri e capiamo la situazione. Niente giri di parole.", accent: "text-[#5E0ED7]", border: "border-purple-100 bg-purple-50/50 hover:border-purple-200" },
  { n: "02", title: "Proponiamo", desc: "Ti facciamo vedere le opzioni, ti diciamo i costi e i tempi. Poi scegli tu, con calma.", accent: "text-[#22d3ee]", border: "border-cyan-100 bg-cyan-50/50 hover:border-cyan-200" },
  { n: "03", title: "Ci siamo dopo", desc: "Se qualcosa non va dopo l'attivazione, chiamaci. Stesso numero, stessa persona di prima.", accent: "text-emerald-500", border: "border-emerald-100 bg-emerald-50/50 hover:border-emerald-200" },
];

export default function HomeContent() {
  return (
    <>
      {/* ═══════════════════════════════════════
          SERVIZI — white
      ═══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-[#5E0ED7]/4 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#22d3ee]/4 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="mb-14 space-y-5">
            <FadeUp>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#5E0ED7]/20 bg-[#5E0ED7]/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E0ED7]" />
                I nostri servizi
              </span>
            </FadeUp>

            <TextReveal>
              <h2 className="text-slate-900" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.02em" }}>
                Tutto quello che cerchi.
              </h2>
            </TextReveal>
            <TextReveal delay={0.12}>
              <h2
                className="inline-block bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: "heroGradientShift 5s ease infinite",
                }}
              >
                Da noi.
              </h2>
            </TextReveal>

            <FadeUp delay={0.3}>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                Pagamenti, telefonia, energia, spedizioni, SPID, PEC e siti web.
                Passa da noi, ti spieghiamo tutto.
              </p>
            </FadeUp>

            <GradientDraw delay={0.4} className="h-px w-40 bg-linear-to-r from-[#5E0ED7] to-[#22d3ee]" />
          </div>

          <FadeUp delay={0.2}>
            <HomeServicesGrid />
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="mt-14 text-center">
              <Link
                href="/servizi"
                className="group inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:border-[#5E0ED7]/30 hover:shadow-md"
                style={{ color: "#0f172a" }}
              >
                Esplora tutti i servizi
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                  <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          COME LAVORIAMO — off-white
      ═══════════════════════════════════════ */}
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
                <h2 className="text-slate-900" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  Tre passi.
                </h2>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h2 className="text-slate-900" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  Nessuna sorpresa.
                </h2>
              </TextReveal>
            </div>
            <FadeUp delay={0.3}>
              <p className="max-w-sm text-sm leading-relaxed text-slate-600 md:text-base">
                Ti diciamo cosa facciamo, quanto ci vuole e quanto costa. Sempre la stessa persona, dall&apos;inizio alla fine.
              </p>
            </FadeUp>
          </div>

          {/* Timeline connector — desktop */}
          <div className="relative">
            <GradientDraw
              delay={0.2}
              className="absolute left-[16.67%] right-[16.67%] top-1.5 hidden h-px bg-linear-to-r from-[#5E0ED7]/20 via-[#22d3ee]/20 to-emerald-400/20 md:block"
            />

            <div className="grid gap-10 md:grid-cols-3 md:gap-6">
              {STEPS.map((step, i) => (
                <ScaleCard key={step.n} delay={0.15 + i * 0.12}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative z-10 mb-6 h-3 w-3 rounded-full ${step.accent} bg-current shadow-[0_0_12px] shadow-current/30`} />
                    <div className={`group relative w-full overflow-hidden rounded-2xl border p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${step.border}`}>
                      <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-[#5E0ED7] to-[#22d3ee] transition-transform duration-500 group-hover:scale-x-100" />
                      <p className={`text-6xl font-black leading-none ${step.accent} opacity-15`}>{step.n}</p>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                </ScaleCard>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          PERCHÉ NOI — white
      ═══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-[#5E0ED7]/3 blur-[120px]" />
          <div className="absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-[#22d3ee]/3 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="mb-16">
            <FadeUp>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Perch&eacute; AG SERVIZI
              </p>
            </FadeUp>
            <TextReveal>
              <h2 className="text-slate-900" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.02em" }}>
                Sempre gli stessi.
              </h2>
            </TextReveal>
            <TextReveal delay={0.12}>
              <h2
                className="inline-block bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: "heroGradientShift 5s ease infinite",
                }}
              >
                Dal 2016.
              </h2>
            </TextReveal>
          </div>

          {/* Value cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {values.map((val, i) => (
              <ScaleCard key={val.title} delay={0.1 + i * 0.12}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#5E0ED7]/20 hover:shadow-xl">
                  <div className="h-[2px] absolute inset-x-0 top-0 w-full rounded-t-2xl bg-linear-to-r from-[#5E0ED7] via-purple-400 to-[#22d3ee] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className={`mb-5 inline-flex rounded-xl p-3 ${ICON_COLORS[i].bg} ${ICON_COLORS[i].text}`}>
                    {VALUE_ICONS[i]}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{val.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{val.description}</p>
                </div>
              </ScaleCard>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Attivi dal", num: 2016, suffix: "", accent: true },
              { label: "Servizi gestiti", num: 30, suffix: "+", accent: false },
              { label: "Clienti attivi", num: 500, suffix: "+", accent: false },
              { label: "su Google", num: 5, suffix: "★", accent: false },
            ].map((stat, i) => (
              <ScaleCard key={stat.label} delay={0.3 + i * 0.1}>
                <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-10 text-center transition-all duration-300 hover:shadow-md ${
                  stat.accent
                    ? "border-[#5E0ED7]/15 bg-[#5E0ED7]/4"
                    : "border-slate-100 bg-slate-50/80"
                }`}>
                  <p className="font-black tracking-tight text-slate-900" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                    <ScrollCounter target={stat.num} delay={0.5 + i * 0.15} />
                    {stat.suffix && <span className="text-[#5E0ED7]">{stat.suffix}</span>}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </ScaleCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          RECENSIONI — off-white
      ═══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-24 md:py-32">
        <Container className="relative">
          <div className="mb-14 flex flex-col items-center text-center">
            <FadeUp>
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} viewBox="0 0 20 20" className="h-5 w-5 text-amber-400" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Cosa dicono di noi
              </p>
            </FadeUp>
            <TextReveal delay={0.15}>
              <h2 className="mt-3 text-slate-900" style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)", lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.02em" }}>
                Parla chi ha provato.
              </h2>
            </TextReveal>
          </div>
        </Container>
        <HomeReviews />
      </section>

      {/* ═══════════════════════════════════════
          AREA CLIENTI — dark accent
      ═══════════════════════════════════════ */}
      <ClientAreaInteractiveHero />

      {/* ═══════════════════════════════════════
          Deposito Bagagli
      ═══════════════════════════════════════ */}
      <LuggageBookingWidget />

      {/* ═══════════════════════════════════════
          CTA FINALE — white premium
      ═══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-28 md:py-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#5E0ED7]/5 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#22d3ee]/4 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <FadeUp>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]">
                Pronto a iniziare?
              </p>
            </FadeUp>

            <TextReveal delay={0.1} className="mt-6">
              <h2 className="text-slate-900" style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", lineHeight: 0.88, fontWeight: 900, letterSpacing: "-0.02em" }}>
                Vieni da noi.
              </h2>
            </TextReveal>
            <TextReveal delay={0.2}>
              <h2
                className="inline-block bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                  lineHeight: 0.88,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: "heroGradientShift 5s ease infinite",
                }}
              >
                Risolviamo insieme.
              </h2>
            </TextReveal>

            <FadeUp delay={0.35}>
              <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-slate-600">
                Consulenza gratuita, senza impegno. Spiegaci cosa ti serve e ci pensiamo noi.
                Dal 2016, ogni giorno.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contatti"
                  className="group inline-flex items-center gap-3 rounded-full bg-linear-to-r from-[#5E0ED7] to-purple-500 px-9 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(94,14,215,0.25)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(94,14,215,0.4)]"
                >
                  Parla con noi
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none">
                    <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/servizi"
                  className="rounded-full border border-slate-300 bg-slate-100 px-9 py-4 text-sm font-semibold shadow-sm transition-all duration-300 hover:border-[#5E0ED7]/30 hover:shadow-md"
                  style={{ color: "#0f172a" }}
                >
                  Vedi i servizi
                </Link>
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>
    </>
  );
}
