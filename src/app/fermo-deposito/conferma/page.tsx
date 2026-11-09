"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";
import ReviewInvite from "@/components/ReviewInvite";
/* Callers: fermo success. User: micro-copy recensioni conferma fermo. */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function ConfermaContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const pickupUrl = searchParams.get("pickupUrl") ?? "";
  const date = searchParams.get("date") ?? "";
  const dailyRate = searchParams.get("dailyRate");
  const reduced = useReducedMotion();

  const rateLabel =
    dailyRate != null && dailyRate !== ""
      ? Number(dailyRate).toFixed(2).replace(".", ",")
      : "0,50";

  return (
    <main className="flex min-h-screen items-center bg-slate-950 py-32">
      <Container className="text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-lg"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <svg
              className="h-10 w-10 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Prenotazione confermata
          </h1>

          <p className="mt-4 text-base text-slate-400">
            Il fermo deposito è registrato. Conserva il codice qui sotto: ti
            servirà per il ritiro in agenzia.
          </p>

          {code && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <p className="text-sm font-medium text-slate-400">
                Il tuo codice Locker Point
              </p>
              <p className="mt-3 text-4xl font-extrabold tracking-wider text-cyan-400 sm:text-5xl">
                {code}
              </p>
              {date && (
                <p className="mt-4 text-sm text-slate-500">
                  Ritiro previsto:{" "}
                  <span className="text-slate-300">
                    {new Date(date + "T12:00:00").toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
              <p className="mt-2 text-sm text-slate-500">
                Tariffa: &euro;{rateLabel} / giorno per pacco
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {pickupUrl && (
              <a
                href={pickupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Apri pagina ritiro
              </a>
            )}
            <Link
              href={`/fermo-deposito/pacco/${encodeURIComponent(code)}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#5E0ED7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6d22e8]"
            >
              Dettaglio prenotazione
            </Link>
            <Link
              href="/fermo-deposito"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Nuova prenotazione
            </Link>
          </div>

          <ReviewInvite tone="dark" className="mx-auto mt-8 max-w-sm" />

          <p className="mt-8 text-xs text-slate-600">
            Via Plinio il Vecchio 72 · Castellammare di Stabia
          </p>
        </motion.div>
      </Container>
    </main>
  );
}

export default function ConfermaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <p className="text-sm text-slate-500">Caricamento...</p>
        </div>
      }
    >
      <ConfermaContent />
    </Suspense>
  );
}
