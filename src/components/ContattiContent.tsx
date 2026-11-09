"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Container from "./Container";
import ContactInteractiveSection from "@/components/ContactInteractiveSection";
import ContattiAccordion from "@/components/ContattiAccordion";
import { company, getOpeningHours } from "@/lib/site-data";
/* Callers: /contatti page. Plan: SEO hours from getOpeningHours. */
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeUp } from "@/components/motion/FadeUp";

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const whatsappUrl = `https://wa.me/393773798570?text=${encodeURIComponent(
  "Ciao! Vorrei ricevere informazioni sui vostri servizi."
)}`;

const WhatsAppIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const WhatsAppIconSmall = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

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
        className="h-5 w-5"
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
    iconColor: "text-[var(--ink)]/70",
  },
  {
    id: "sede",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
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
    iconColor: "text-[var(--ink)]/70",
  },
];

const schedule = getOpeningHours().map((row) => ({
  day: row.day,
  hours: row.hours,
  closed: row.hours === "Chiuso",
}));

export default function ContattiContent() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const dur = reduced ? 0.01 : 0.9;

  return (
    <div className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      {/* Hero — Brutal Editorial */}
      <section
        ref={heroRef}
        className="relative min-h-dvh overflow-hidden border-b border-[var(--ink)]/10 bg-[var(--paper)]"
      >
        <div className="shrink-0 pt-24 sm:pt-28 md:pt-32" />

        <motion.div
          className="relative flex min-h-[70vh] flex-col justify-end px-6 pb-16 sm:pb-20 md:px-14 md:pb-24"
          style={reduced ? undefined : { y: contentY }}
        >
          <Container>
            <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-end">
              <div className="space-y-8">
                <FadeUp>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--ink)]/40 sm:text-xs">
                    Contatti / Via Plinio 72
                  </p>
                </FadeUp>

                <div>
                  <TextReveal>
                    <h1 className="display-type m-0 p-0 text-[clamp(2.75rem,8vw,6.5rem)] text-[var(--ink)]">
                      Hai bisogno
                    </h1>
                  </TextReveal>
                  <TextReveal delay={0.08}>
                    <span className="display-type block text-[clamp(2.75rem,8vw,6.5rem)] text-[var(--ink)]">
                      di noi?
                    </span>
                  </TextReveal>
                  <FadeUp delay={0.15}>
                    <span className="display-type block text-[clamp(2.75rem,8vw,6.5rem)] text-[#5E0ED7]">
                      Siamo qui.
                    </span>
                  </FadeUp>
                </div>

                <FadeUp delay={0.2}>
                  <p className="max-w-lg text-base leading-relaxed text-[var(--ink)]/65 sm:text-lg">
                    WhatsApp, telefono o direttamente in Via Plinio 72. Niente
                    call center, niente attese.
                  </p>
                </FadeUp>

                <div className="grid gap-px bg-[var(--ink)]/10 sm:grid-cols-3">
                  {channels.map((ch, i) => (
                    <motion.a
                      key={ch.id}
                      href={ch.href}
                      target={ch.external ? "_blank" : undefined}
                      rel={ch.external ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduced ? 0 : 0.25 + i * 0.08,
                        duration: dur,
                        ease: SPRING_EASE,
                      }}
                      className="flex min-h-[44px] items-center gap-3 border border-[var(--ink)]/10 bg-[var(--paper)] p-4 transition hover:border-[#5E0ED7] hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
                    >
                      <span className={`shrink-0 ${ch.iconColor}`}>{ch.icon}</span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)]">
                          {ch.label}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--ink)]/55">{ch.value}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

              <FadeUp delay={0.25}>
                <div className="space-y-0 border border-[var(--ink)]/10">
                  <div className="border-b border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-5 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
                      Orari di apertura
                    </p>
                    <ul className="mt-5 space-y-3">
                      {schedule.map((r) => (
                        <li
                          key={r.day}
                          className="flex items-center justify-between gap-4 border-b border-[var(--ink)]/8 pb-3 last:border-0 last:pb-0"
                        >
                          <span
                            className={`text-sm font-semibold ${
                              r.closed ? "text-[var(--ink)]/35" : "text-[var(--ink)]"
                            }`}
                          >
                            {r.day}
                          </span>
                          <span
                            className={`font-mono text-sm ${
                              r.closed ? "text-[var(--ink)]/35" : "text-[var(--ink)]/75"
                            }`}
                          >
                            {r.hours}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[var(--paper)] p-5 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
                      Dove siamo
                    </p>
                    <p className="mt-3 text-base font-bold text-[var(--ink)]">
                      Via Plinio il Vecchio 72
                    </p>
                    <p className="text-sm text-[var(--ink)]/55">
                      80053 Castellammare di Stabia (NA)
                    </p>
                    <a
                      href={company.googleBusinessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex min-h-[44px] items-center gap-2 border border-[var(--ink)]/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
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

        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={
              reduced
                ? undefined
                : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
            }
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--ink)]/30">
              Scorri
            </span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path
                d="M7 3v14M2 12l5 5 5-5"
                stroke="currentColor"
                className="text-[var(--ink)]"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Form */}
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] py-24 md:py-32">
        <Container>
          <FadeUp className="mb-12 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#5E0ED7]">
              Scrivici
            </p>
            <TextReveal>
              <h2 className="display-type text-[clamp(2rem,5vw,3.5rem)] text-[var(--ink)]">
                Dimmi di cosa hai bisogno.
              </h2>
            </TextReveal>
            <p className="max-w-xl text-base text-[var(--ink)]/60">
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

      {/* Mappa */}
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] py-24 md:py-32">
        <Container>
          <FadeUp className="mb-10 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#5E0ED7]">
              Trovaci
            </p>
            <TextReveal>
              <h2 className="display-type text-[clamp(1.75rem,4vw,3rem)] text-[var(--ink)]">
                Siamo a Castellammare di Stabia.
              </h2>
            </TextReveal>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="overflow-hidden border border-[var(--ink)]/10">
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

      {/* FAQ */}
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] py-24 md:py-32">
        <Container>
          <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <FadeUp className="space-y-5 md:sticky md:top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#5E0ED7]">
                Domande frequenti
              </p>
              <TextReveal>
                <h2 className="display-type text-[clamp(2rem,5vw,3.5rem)] text-[var(--ink)]">
                  Qualcosa
                  <br />
                  non e chiaro?
                </h2>
              </TextReveal>
              <p className="text-base text-[var(--ink)]/60">
                Le risposte alle domande piu comuni. Se non trovi quello che
                cerchi, scrivici direttamente.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-cta-ink inline-flex min-h-[44px] items-center gap-2 bg-[var(--ink)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
              >
                {WhatsAppIconSmall}
                Scrivici su WhatsApp
              </a>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-5 py-2 sm:px-8 sm:py-4">
                <ContattiAccordion />
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* CTA finale */}
      <section className="relative overflow-hidden bg-[var(--paper)] py-28 md:py-36">
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <FadeUp>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#5E0ED7]">
                Pronti quando sei pronto
              </p>
            </FadeUp>

            <div className="mt-6">
              <TextReveal>
                <h2 className="display-type text-[clamp(2rem,5vw,3.75rem)] text-[var(--ink)]">
                  Vieni.
                </h2>
              </TextReveal>
              <FadeUp delay={0.1}>
                <span className="display-type block text-[clamp(2rem,5vw,3.75rem)] text-[#5E0ED7]">
                  Ti aspettiamo.
                </span>
              </FadeUp>
            </div>

            <FadeUp delay={0.15}>
              <p className="mx-auto mt-6 max-w-md text-[var(--ink)]/60">
                Consulenza gratuita, senza appuntamento, senza impegno. Stessa
                faccia di sempre, stessa agenzia dal 2016.
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-cta-ink inline-flex min-h-[44px] items-center gap-2 bg-[var(--ink)] px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
                >
                  {WhatsAppIconSmall}
                  Scrivi su WhatsApp
                </a>
                <Link
                  href="/servizi"
                  className="inline-flex min-h-[44px] items-center gap-2 border border-[var(--ink)]/20 px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
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
