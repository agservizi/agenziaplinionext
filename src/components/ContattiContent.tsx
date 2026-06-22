"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Container from "./Container";
import ContactInteractiveSection from "@/components/ContactInteractiveSection";
import ContattiAccordion from "@/components/ContattiAccordion";
import { company } from "@/lib/site-data";

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

const whatsappUrl = `https://wa.me/393773798570?text=${encodeURIComponent(
  "Ciao! Vorrei ricevere informazioni sui vostri servizi."
)}`;

/* ─── SVG Icons ─────────────────────────────────────────────────────── */
const WhatsAppIcon = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const WhatsAppIconSmall = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

/* ─── Channel data ──────────────────────────────────────────────────── */
const channels = [
  {
    id: "whatsapp",
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: "Risposta entro 30 min",
    href: whatsappUrl,
    external: true,
    iconColor: "text-[#25D366]",
  },
  {
    id: "phone",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
    label: "Telefono",
    value: "Ti risponde una persona",
    href: "tel:+393773798570",
    external: false,
    iconColor: "text-white/70",
  },
  {
    id: "sede",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    label: "In sede",
    value: "Via Plinio 72, CdS",
    href: company.googleBusinessUrl,
    external: true,
    iconColor: "text-white/70",
  },
];

/* ─── Schedule data ─────────────────────────────────────────────────── */
const schedule = [
  { day: "Lunedi - Venerdi", hours: "08:45-13:20 / 16:20-19:00", closed: false },
  { day: "Sabato", hours: "09:20-12:30", closed: false },
  { day: "Domenica", hours: "Chiuso", closed: true },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function ContattiContent() {
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
            poster="/images/contatti-poster.jpg"
            className="h-[120%] w-full object-cover"
            style={{ opacity: 0.35 }}
          >
            <source
              src="https://assets.mixkit.co/videos/13325/13325-720.mp4"
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
            <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start">
              {/* Left column */}
              <div className="space-y-8">
                {/* Badge */}
                <FadeUp>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E0ED7]" />
                    Contatti
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
                      Hai bisogno
                    </h1>
                  </TextReveal>
                  <TextReveal delay={0.08}>
                    <span
                      className="text-white"
                      style={{
                        fontSize: "clamp(2.5rem, 7vw, 5rem)",
                        lineHeight: 0.92,
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        display: "block",
                      }}
                    >
                      di noi?
                    </span>
                  </TextReveal>
                  <FadeUp delay={0.15}>
                    <span
                      className="inline-block"
                      style={{
                        fontSize: "clamp(2.5rem, 7vw, 5rem)",
                        lineHeight: 1.2,
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        backgroundImage:
                          "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                        backgroundSize: "300% 100%",
                        animation: reduced
                          ? "none"
                          : "heroGradientShift 5s ease infinite",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Siamo qui.
                    </span>
                  </FadeUp>
                </div>

                {/* Description */}
                <FadeUp delay={0.2}>
                  <p
                    className="max-w-lg text-lg"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    WhatsApp, telefono o direttamente in Via Plinio 72. Niente
                    call center, niente attese.
                  </p>
                </FadeUp>

                {/* Channel cards */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {channels.map((ch, i) => (
                    <ScaleCard key={ch.id} delay={0.1 + i * 0.08}>
                      <a
                        href={ch.href}
                        target={ch.external ? "_blank" : undefined}
                        rel={ch.external ? "noopener noreferrer" : undefined}
                        className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
                      >
                        <span className={`shrink-0 ${ch.iconColor}`}>
                          {ch.icon}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {ch.label}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            {ch.value}
                          </p>
                        </div>
                      </a>
                    </ScaleCard>
                  ))}
                </div>
              </div>

              {/* Right column -- Orari + Indirizzo */}
              <FadeUp delay={0.25}>
                <div className="space-y-4">
                  {/* Orari */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Orari di apertura
                    </p>
                    <ul className="mt-5 space-y-3">
                      {schedule.map((r) => (
                        <li
                          key={r.day}
                          className="flex items-center justify-between gap-4"
                        >
                          <span
                            className={`text-sm font-semibold ${
                              r.closed ? "text-white/30" : "text-white"
                            }`}
                          >
                            {r.day}
                          </span>
                          <span
                            className="text-sm font-mono"
                            style={{
                              color: r.closed
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(255,255,255,0.85)",
                            }}
                          >
                            {r.hours}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Indirizzo */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Dove siamo
                    </p>
                    <p className="mt-3 text-base font-bold text-white">
                      Via Plinio il Vecchio 72
                    </p>
                    <p className="text-sm text-slate-400">
                      80053 Castellammare di Stabia (NA)
                    </p>
                    <a
                      href={company.googleBusinessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Apri su Google Maps
                    </a>
                  </div>
                </div>
              </FadeUp>
            </div>
          </Container>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Scorri
            </span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path
                d="M7 3v14M2 12l5 5 5-5"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          FORM
      ══════════════════════════════════════ */}
      <section className="lux-surface py-24 md:py-32">
        <Container>
          <FadeUp className="mb-12 space-y-3">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#5E0ED7" }}
            >
              Scrivici
            </p>
            <TextReveal>
              <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Dimmi di cosa hai bisogno.
              </h2>
            </TextReveal>
            <p className="max-w-xl text-base text-slate-500">
              Scegli l&apos;argomento, compila il form o apri WhatsApp con un
              messaggio precompilato. Ti risponderemo nel piu breve tempo
              possibile.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ContactInteractiveSection />
          </FadeUp>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          MAPPA
      ══════════════════════════════════════ */}
      <section className="lux-surface py-24 md:py-32">
        <Container>
          <FadeUp className="mb-10 space-y-3">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#5E0ED7" }}
            >
              Trovaci
            </p>
            <TextReveal>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
                Siamo a Castellammare di Stabia.
              </h2>
            </TextReveal>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-xl">
              <iframe
                title="Mappa AG SERVIZI"
                src="https://www.google.com/maps?q=Via%20Plinio%20il%20Vecchio%2072%2C%2080053%20Castellammare%20di%20Stabia%20(NA)&output=embed"
                className="h-80 w-full border-0 md:h-112"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          FAQ ACCORDION
      ══════════════════════════════════════ */}
      <section className="lux-surface py-24 md:py-32">
        <Container>
          <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            {/* Left heading */}
            <FadeUp className="space-y-5 md:sticky md:top-28">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#5E0ED7" }}
              >
                Domande frequenti
              </p>
              <TextReveal>
                <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                  Qualcosa
                  <br />
                  non e chiaro?
                </h2>
              </TextReveal>
              <p className="text-base text-slate-500">
                Le risposte alle domande piu comuni. Se non trovi quello che
                cerchi, scrivici direttamente.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                {WhatsAppIconSmall}
                Scrivici su WhatsApp
              </a>
            </FadeUp>

            {/* Right accordion */}
            <FadeUp delay={0.15}>
              <div className="rounded-2xl border border-slate-100 bg-white px-8 py-4 shadow-sm">
                <ContattiAccordion />
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA FINALE
      ══════════════════════════════════════ */}
      <section className="lux-surface relative overflow-hidden py-28 md:py-36">
        {/* Subtle orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-1/4 h-[300px] w-[300px] rounded-full bg-[#5E0ED7]/5 blur-[120px]" />
          <div className="absolute -right-24 bottom-1/4 h-[250px] w-[250px] rounded-full bg-[#22d3ee]/5 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <FadeUp>
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#5E0ED7" }}
              >
                Pronti quando sei pronto
              </p>
            </FadeUp>

            <div className="mt-6">
              <TextReveal>
                <h2
                  className="text-slate-900"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.75rem)",
                    lineHeight: 0.95,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Vieni.
                </h2>
              </TextReveal>
              <FadeUp delay={0.1}>
                <span
                  className="inline-block"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.75rem)",
                    lineHeight: 1.2,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    backgroundImage:
                      "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                    backgroundSize: "300% 100%",
                    animation: reduced
                      ? "none"
                      : "heroGradientShift 5s ease infinite",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Ti aspettiamo.
                </span>
              </FadeUp>
            </div>

            <FadeUp delay={0.15}>
              <p className="mx-auto mt-6 max-w-md text-slate-500">
                Consulenza gratuita, senza appuntamento, senza impegno. Stessa
                faccia di sempre, stessa agenzia dal 2016.
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                >
                  {WhatsAppIconSmall}
                  Scrivi su WhatsApp
                </a>
                <Link
                  href="/servizi"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold transition hover:border-slate-300 hover:bg-slate-50"
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
