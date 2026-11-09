"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h10M4 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "Home e SEO",
    desc: "Hero, tagline, CTA e meta",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "Impostazioni",
    desc: "Anagrafica, nav e orari",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M7 4h10v16H7V4Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "Schede servizi",
    desc: "Testi di tutte le categorie",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    ),
    label: "FAQ e recensioni",
    desc: "Contenuti di fiducia",
  },
];

export default function AdminLoginHeroPanel() {
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
              Area Admin
            </motion.p>

            <h1 className="display-type m-0 p-0 text-[clamp(2.25rem,4vw,3.75rem)] text-[var(--paper)]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                >
                  Personalizza.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-[#5E0ED7]"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
                >
                  Pubblica.
                </motion.span>
              </span>
            </h1>

            <motion.p
              className="max-w-sm text-sm leading-relaxed text-[var(--paper)]/55"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            >
              Modifica testi, homepage, servizi, FAQ e recensioni del sito. Le pratiche clienti e i listini pubblici restano su Gestiio.
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
