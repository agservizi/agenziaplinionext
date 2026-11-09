"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { readClientPortalTokenPayload } from "@/lib/client-portal-auth";
import { clientAreas } from "@/lib/client-area";

export default function ClientAreaDashboard() {
  const reduceMotion = useReducedMotion() ?? false;
  const [name, setName] = useState("Cliente");

  useEffect(() => {
    const payload = readClientPortalTokenPayload();
    setName(payload?.fullName || payload?.username || "Cliente");
  }, []);

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-10 md:px-8 md:py-12">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40"
        >
          Area clienti · AG SERVIZI
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.05 }}
          className="display-type mt-3 max-w-3xl text-[clamp(2rem,4vw,3.25rem)]"
        >
          Ciao {name.split(" ")[0]}, ecco i servizi attivi.
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.1 }}
          className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink)]/55 md:text-base"
        >
          Apri una pratica, paga online se serve e segui lo stato senza passare in sede.
          Gestisci pratiche, documenti e pagamenti da qui.
        </motion.p>
      </section>

      <section className="grid gap-px bg-[var(--ink)]/10 sm:grid-cols-2 xl:grid-cols-3">
        {clientAreas.map((area, index) => (
          <motion.div
            key={area.key}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.35 }}
            className="bg-[var(--paper)] p-6 md:p-7"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
              {area.eyebrow}
            </p>
            <h2 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">{area.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/55">{area.subtitle}</p>
            <ul className="mt-4 space-y-1.5">
              {area.highlights.slice(0, 3).map((item) => (
                <li key={item} className="text-xs font-medium text-[var(--ink)]/65">
                  — {item}
                </li>
              ))}
            </ul>
            <Link
              href={area.path}
              className="brutal-cta-ink mt-6 inline-flex items-center justify-center bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7]"
            >
              {area.cta}
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="border-t border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/area-clienti/pagamenti"
            className="border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/70 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Pagamenti
          </Link>
          <Link
            href="/area-clienti/documenti"
            className="border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/70 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Documenti
          </Link>
          <Link
            href="/area-clienti/profilo"
            className="border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/70 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Profilo
          </Link>
        </div>
      </section>
    </div>
  );
}
