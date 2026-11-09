"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clientAreas, type ClientAreaConfig } from "@/lib/client-area";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ClientAreaInteractiveHero() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeKey, setActiveKey] = useState(clientAreas[0]?.key ?? "send");
  const featured: ClientAreaConfig =
    clientAreas.find((area) => area.key === activeKey) || clientAreas[0];

  return (
    <section className="relative overflow-hidden border-y border-[var(--ink)]/10 bg-[var(--paper)] text-[var(--ink)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-24">
        <div>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40"
          >
            Area Clienti
          </motion.p>
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.05, ease: EASE }}
            className="display-type mt-4 max-w-xl text-[clamp(2.4rem,5vw,4rem)] leading-[0.95]"
          >
            AG SERVIZI
            <span className="mt-2 block text-[0.55em] font-normal tracking-normal text-[var(--ink)]/55">
              pratiche online, senza salti in sede
            </span>
          </motion.h2>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1, ease: EASE }}
            className="mt-5 max-w-md text-sm leading-relaxed text-[var(--ink)]/55 md:text-base"
          >
            Telefonia, energia, SEND, visure, CAF, locker e deposito: apri la pratica
            dall&apos;account, paga se serve e segui lo stato. 
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.14, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/login"
              className="brutal-cta-ink inline-flex items-center justify-center bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7]"
            >
              Accedi area clienti
            </Link>
            <Link
              href="/area-clienti"
              className="inline-flex items-center justify-center border border-[var(--ink)]/20 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Vai alla dashboard
            </Link>
          </motion.div>
        </div>

        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2">
            {clientAreas.map((area, index) => {
              const active = area.key === featured.key;
              return (
                <motion.button
                  key={area.key}
                  type="button"
                  onClick={() => setActiveKey(area.key)}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.03, ease: EASE }}
                  className={`border px-4 py-3 text-left transition ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] text-[var(--ink)] hover:border-[var(--ink)]/35"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
                    {area.eyebrow}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug">{area.title}</p>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={featured.key}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mt-4 border border-[var(--ink)] bg-[var(--ink)] p-6 text-[var(--paper)] md:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--paper)]/45">
                {featured.eyebrow}
                {featured.readOnly ? " · sola lettura" : ""}
              </p>
              <h3 className="display-type mt-3 text-[clamp(1.6rem,2.5vw,2.2rem)] leading-none">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--paper)]/65">
                {featured.description}
              </p>
              <ul className="mt-5 space-y-1.5">
                {featured.highlights.map((item) => (
                  <li key={item} className="text-xs font-medium text-[var(--paper)]/75">
                    — {item}
                  </li>
                ))}
              </ul>
              <Link
                href={featured.path}
                className="mt-6 inline-flex items-center justify-center border border-[var(--paper)] bg-[var(--paper)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:bg-[#22d3ee] hover:border-[#22d3ee]"
              >
                {featured.cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
