"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { getYearsActive } from "@/lib/site-data";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_ITEMS = [
  {
    value: `${getYearsActive()}+`,
    label: "Anni di attività",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    value: "500+",
    label: "Clienti attivi",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
        <circle cx="19" cy="8" r="3" />
        <path d="M22 21v-1.5a3 3 0 00-2.5-2.96" />
      </svg>
    ),
  },
  {
    value: "5★",
    label: "su Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    value: "30+",
    label: "Servizi gestiti",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export default function MarqueeStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className="lux-surface border-y border-slate-200/60 py-5 sm:py-6"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 sm:grid-cols-4 sm:gap-6 md:px-10">
        {TRUST_ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={isInView || reduced ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5E0ED7]/8 text-[#5E0ED7]">
              {item.icon}
            </div>
            <div>
              <p className="text-lg font-black leading-tight text-slate-900 sm:text-xl">
                {item.value}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {item.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
