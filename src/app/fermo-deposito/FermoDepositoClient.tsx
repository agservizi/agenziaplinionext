"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";
import LockerPointBookingForm from "@/components/LockerPointBookingForm";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function FermoDepositoContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? "";
  const reduced = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#5E0ED7]/20 blur-[100px]" />
        <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-[#22d3ee]/15 blur-[90px]" />
      </div>

      <Container className="relative py-24 md:py-32">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-5xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#22d3ee]">
            Locker Point
          </p>
          <h1
            className="mt-3 font-black text-white"
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Fermo deposito pacchi
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
            Prenota online la custodia del tuo pacco presso AG SERVIZI a
            Castellammare di Stabia. Da{" "}
            <span className="font-semibold text-white">&euro;0,50 al giorno</span>
            . Ritiri quando vuoi, negli orari di apertura.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5 text-sm leading-relaxed text-slate-400">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-sm font-semibold text-white">
                  Come funziona
                </h2>
                <ol className="mt-3 list-decimal space-y-2 pl-4">
                  <li>Prenoti online e ricevi il codice LP.</li>
                  <li>
                    Il pacco arriva in agenzia (o lo consegni tu) e lo
                    custodiamo.
                  </li>
                  <li>Al ritiro mostri il codice e firmi.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-sm font-semibold text-white">Dove</h2>
                <p className="mt-2">
                  AG SERVIZI — Via Plinio il Vecchio 72, Castellammare di Stabia
                  (NA)
                </p>
              </div>
              <Link
                href="/deposito-bagagli"
                className="inline-flex text-sm font-medium text-[#22d3ee]/80 hover:text-[#22d3ee]"
              >
                Cerchi deposito bagagli? Vai qui →
              </Link>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md sm:p-7">
              <LockerPointBookingForm initialDate={initialDate} />
            </div>
          </div>
        </motion.div>
      </Container>
    </main>
  );
}

export default function FermoDepositoClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <p className="text-sm text-slate-500">Caricamento…</p>
        </div>
      }
    >
      <FermoDepositoContent />
    </Suspense>
  );
}
