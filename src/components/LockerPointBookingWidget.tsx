"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import LockerPointBookingForm, {
  type LockerPricing,
} from "./LockerPointBookingForm";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function PackageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 8.5l-9-5-9 5v7l9 5 9-5v-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M3 8.5l9 5 9-5M12 13.5V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 2h2v2h-2v-2zm4-2h2v6h-2v-2h-2v-2h2v-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LockerPointBookingWidget() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [dailyRateLabel, setDailyRateLabel] = useState("0,50");

  const handlePricingLoaded = (pricing: LockerPricing) => {
    setDailyRateLabel(pricing.dailyRate.toFixed(2).replace(".", ","));
  };

  const trustItems = [
    { icon: <ShieldIcon />, text: "Custodia in agenzia" },
    { icon: <QrIcon />, text: "Codice LP + QR" },
    { icon: <ClockIcon />, text: "Da €0,50 al giorno" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      aria-labelledby="locker-point-heading"
    >
      <div className="absolute inset-0 bg-linear-to-br from-[#071018] via-[#0a1f2e] to-[#0c2a3a]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
        aria-hidden="true"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={reduced ? undefined : { x: [0, -25, 0], y: [0, 18, 0] }}
          transition={
            reduced
              ? undefined
              : { repeat: Infinity, duration: 14, ease: "easeInOut" }
          }
          className="absolute -right-28 top-1/5 h-[320px] w-[320px] rounded-full opacity-25 blur-[110px] md:h-[480px] md:w-[480px]"
          style={{
            background: "radial-gradient(circle, #22d3ee, transparent 70%)",
          }}
        />
        <motion.div
          animate={reduced ? undefined : { x: [0, 20, 0], y: [0, -22, 0] }}
          transition={
            reduced
              ? undefined
              : { repeat: Infinity, duration: 16, ease: "easeInOut" }
          }
          className="absolute -left-20 bottom-1/5 h-[260px] w-[260px] rounded-full opacity-20 blur-[100px] md:h-[380px] md:w-[380px]"
          style={{
            background: "radial-gradient(circle, #5E0ED7, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-20 sm:px-6 md:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div>
              <FadeUp>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60 backdrop-blur-sm">
                  <PackageIcon className="h-3.5 w-3.5" />
                  Fermo deposito
                </span>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h2
                  id="locker-point-heading"
                  className="mt-5 font-black text-white"
                  style={{
                    fontSize: "clamp(2rem, 5.5vw, 3.6rem)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Hai un pacco in arrivo?
                </h2>
              </FadeUp>

              <FadeUp delay={0.18}>
                <p
                  className="mt-2 inline-block bg-clip-text font-bold text-transparent"
                  style={{
                    fontSize: "clamp(1.35rem, 3.5vw, 2.25rem)",
                    lineHeight: 1.15,
                    backgroundImage:
                      "linear-gradient(90deg, #22d3ee, #a855f7, #5E0ED7)",
                  }}
                >
                  Lo teniamo noi.
                </p>
              </FadeUp>

              <FadeUp delay={0.28}>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
                  Prenota il fermo deposito online: quando il corriere lascia il
                  pacco in agenzia, lo custodiamo fino al ritiro. Da{" "}
                  <span className="font-semibold text-white/85">
                    &euro;{dailyRateLabel} al giorno
                  </span>
                  , per pacco.
                </p>
              </FadeUp>

              <FadeUp delay={0.38}>
                <ul className="mt-8 space-y-3 text-sm text-white/50">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22d3ee]" />
                    Prenotazione immediata con codice LP
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22d3ee]" />
                    Ritiro in Via Plinio il Vecchio 72
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22d3ee]" />
                    Ideale per Amazon, BRT, GLS e altri corrieri
                  </li>
                </ul>
              </FadeUp>

              <FadeUp delay={0.48}>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {trustItems.map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-2 text-white/40"
                    >
                      {item.icon}
                      <span className="text-xs font-medium sm:text-sm">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeUp>

              <FadeUp delay={0.55}>
                <p className="mt-6 text-xs text-white/35">
                  Preferisci una pagina dedicata?{" "}
                  <Link
                    href="/fermo-deposito"
                    className="font-medium text-[#22d3ee]/80 underline-offset-2 hover:text-[#22d3ee] hover:underline"
                  >
                    Vai a Fermo deposito
                  </Link>
                </p>
              </FadeUp>
            </div>

            <FadeUp delay={0.25}>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                      Prenota ora
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      Compila e ricevi subito il codice
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/10 px-3 py-2 text-center">
                    <p className="text-lg font-bold leading-none text-[#22d3ee]">
                      &euro;{dailyRateLabel}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
                      / giorno
                    </p>
                  </div>
                </div>
                <LockerPointBookingForm
                  compact
                  onPricingLoaded={handlePricingLoaded}
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
