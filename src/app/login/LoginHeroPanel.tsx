"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M21 8.5L12 3L3 8.5V15.5L12 21L21 15.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 8.5L12 14L21 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "Spedizioni BRT e InPost",
    desc: "Ritiro, tracking e etichette",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9L14 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "Visure e documenti",
    desc: "Camerali, catastali, PRA",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "CAF e Patronato",
    desc: "ISEE, 730, pensioni, bonus",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Disponibile 24/7",
    desc: "Apri pratiche quando vuoi",
  },
];

export default function LoginHeroPanel() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] shrink-0 relative flex-col justify-between overflow-hidden border-r border-white/[0.06]">
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-[#0a0a1a] to-slate-950" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="orb-float-1 absolute -left-20 top-1/4 h-[350px] w-[350px] rounded-full bg-[#5E0ED7]/20 blur-[120px]" />
        <div className="orb-float-2 absolute -right-16 bottom-1/3 h-[280px] w-[280px] rounded-full bg-[#22d3ee]/12 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image src="/logo.png" alt="AG SERVIZI" width={155} height={32} className="h-8 w-auto opacity-80 transition group-hover:opacity-100" priority />
          </Link>
        </motion.div>

        <div className="space-y-10">
          <div className="space-y-5">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5E0ED7]"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              Area Clienti
            </motion.p>

            <div className="overflow-hidden">
              <motion.h1
                className="text-white"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.1, fontWeight: 900, letterSpacing: "-0.02em" }}
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              >
                Il tuo spazio.
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.span
                className="inline-block"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                  backgroundSize: "300% 100%",
                  animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
              >
                Tutto sotto controllo.
              </motion.span>
            </div>

            <motion.p
              className="max-w-sm text-sm leading-relaxed text-white/40"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            >
              Accedi o registrati per gestire spedizioni, visure, pratiche CAF e tutti i servizi AG SERVIZI da un unico posto.
            </motion.p>
          </div>

          <motion.div
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
            className="h-px w-32 origin-left bg-linear-to-r from-[#5E0ED7] to-[#22d3ee]"
          />

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.55 + i * 0.08 }}
              >
                <span className="text-[#5E0ED7]">{f.icon}</span>
                <p className="mt-2 text-sm font-semibold text-white/80">{f.label}</p>
                <p className="mt-0.5 text-xs text-white/30">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          className="text-[11px] text-white/15"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          © {new Date().getFullYear()} AG SERVIZI — Via Plinio il Vecchio 72, Castellammare di Stabia
        </motion.p>
      </div>
    </div>
  );
}
