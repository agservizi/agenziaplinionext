"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function ConfermaContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const reduced = useReducedMotion();

  return (
    <main className="flex min-h-screen items-center bg-slate-950 py-32">
      <Container className="text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-lg"
        >
          {/* Success icon */}
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
            La tua prenotazione per il deposito bagagli è stata registrata con
            successo. Conserva il codice qui sotto.
          </p>

          {/* Code card */}
          {code && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <p className="text-sm font-medium text-slate-400">
                Il tuo codice deposito
              </p>
              <p className="mt-3 text-4xl font-extrabold tracking-wider text-cyan-400 sm:text-5xl">
                {code}
              </p>
            </div>
          )}

          {/* Links */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {code && (
              <Link
                href={`/deposito-bagagli/deposito/${encodeURIComponent(code)}`}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Vedi i dettagli
              </Link>
            )}
            <Link
              href="/deposito-bagagli/i-miei-depositi"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              I miei depositi
            </Link>
          </div>
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
