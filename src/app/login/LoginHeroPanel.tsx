"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M21 8.5L12 3L3 8.5V15.5L12 21L21 15.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" />
        <path d="M3 8.5L12 14L21 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        <path d="M12 14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "Notifiche SEND",
    desc: "Pratiche digitali e documenti",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9L14 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" />
        <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "Visure e documenti",
    desc: "Camerali, catastali, PRA",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="5" y="4" width="14" height="17" rx="0" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "CAF e Patronato",
    desc: "ISEE, 730, pensioni, bonus",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    label: "Disponibile 24/7",
    desc: "Apri pratiche quando vuoi",
  },
];

export default function LoginHeroPanel() {
  const reduced = useReducedMotion();

  return (
    <div className="relative hidden shrink-0 flex-col justify-between overflow-hidden border-r border-[var(--ink)]/10 bg-[var(--ink)] text-[var(--paper)] lg:flex lg:w-[48%] xl:w-[52%]">
      <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Link href="/" className="group inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AG SERVIZI"
              width={155}
              height={32}
              className="h-8 w-auto brightness-0 invert opacity-80 transition group-hover:opacity-100"
              priority
            />
          </Link>
        </motion.div>

        <div className="space-y-10">
          <div className="space-y-5">
            <motion.p
              className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#5E0ED7]"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              Area Clienti
            </motion.p>

            <h1 className="display-type m-0 p-0 text-[clamp(2.25rem,4vw,3.75rem)] text-[var(--paper)]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                >
                  Il tuo spazio.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-[#5E0ED7]"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
                >
                  Sotto controllo.
                </motion.span>
              </span>
            </h1>

            <motion.p
              className="max-w-sm text-sm leading-relaxed text-[var(--paper)]/55"
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
            className="h-px w-24 origin-left bg-[#5E0ED7]"
          />

          <div className="grid grid-cols-2 gap-px bg-[var(--paper)]/15">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                className="bg-[var(--ink)] p-4"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.55 + i * 0.08 }}
              >
                <span className="text-[#5E0ED7]">{f.icon}</span>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--paper)]">
                  {f.label}
                </p>
                <p className="mt-1 text-xs text-[var(--paper)]/45">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--paper)]/30"
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
