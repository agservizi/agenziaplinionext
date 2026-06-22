"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";

/* ─── Types ────────────────────────────────────────────────────────── */

type DepositStatus =
  | "PRENOTATO"
  | "CHECK_IN"
  | "COMPLETATO"
  | "ANNULLATO"
  | "NO_SHOW";

type DepositSummary = {
  depositCode: string;
  bookingDate: string;
  bagCount: number;
  status: DepositStatus;
  totalAmount: number;
  currency: string;
};

type FetchState = "idle" | "loading" | "done" | "error";

/* ─── Constants ────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STATUS_BADGE: Record<DepositStatus, string> = {
  PRENOTATO:
    "bg-[#5E0ED7]/15 text-purple-300 ring-1 ring-[#5E0ED7]/40",
  CHECK_IN:
    "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40",
  COMPLETATO:
    "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40",
  ANNULLATO:
    "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40",
  NO_SHOW:
    "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/40",
};

const STATUS_LABEL: Record<DepositStatus, string> = {
  PRENOTATO: "Prenotato",
  CHECK_IN: "Check-in",
  COMPLETATO: "Completato",
  ANNULLATO: "Annullato",
  NO_SHOW: "No show",
};

const INPUT_CLASS =
  "w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-500";

/* ─── Animation wrappers ───────────────────────────────────────────── */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      animate={isInView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function DepositsListClient() {
  const reduced = useReducedMotion();

  const [email, setEmail] = useState("");
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [deposits, setDeposits] = useState<DepositSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const limit = 10;

  async function fetchDeposits(pageNum = 1) {
    if (!email.trim()) return;
    setFetchState("loading");
    setErrorMsg("");

    try {
      const params = new URLSearchParams({
        email: email.trim(),
        page: String(pageNum),
        limit: String(limit),
      });
      const res = await fetch(`/api/deposito-bagagli/deposits?${params}`);
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(
          json.error?.message ?? "Impossibile recuperare i depositi.",
        );
      }

      const data = json.data ?? json;
      setDeposits(data.deposits ?? data.items ?? []);
      setTotal(data.total ?? data.deposits?.length ?? 0);
      setPage(pageNum);
      setFetchState("done");
    } catch (err) {
      setFetchState("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Si e verificato un errore. Riprova.",
      );
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchDeposits(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      <Container className="mb-12 text-center">
        <FadeUp>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            I miei depositi
          </h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
            Inserisci la tua email per visualizzare le prenotazioni di deposito
            bagagli.
          </p>
        </FadeUp>
      </Container>

      {/* ── Search form ───────────────────────────────────────────── */}
      <Container>
        <FadeUp delay={0.15}>
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md gap-3"
          >
            <label className="sr-only" htmlFor="deposit-email">
              Indirizzo email
            </label>
            <input
              id="deposit-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder="La tua email"
              aria-label="Indirizzo email"
            />
            <button
              type="submit"
              disabled={fetchState === "loading"}
              className="shrink-0 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40"
            >
              {fetchState === "loading" ? "Ricerca..." : "Cerca"}
            </button>
          </form>
        </FadeUp>
      </Container>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {errorMsg && (
        <Container className="mt-8">
          <p
            role="alert"
            className="mx-auto max-w-md text-center text-sm text-rose-300"
          >
            {errorMsg}
          </p>
        </Container>
      )}

      {/* ── Results ───────────────────────────────────────────────── */}
      {fetchState === "done" && (
        <Container className="mt-12">
          {deposits.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Nessun deposito trovato per questa email.
            </p>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {deposits.map((d, i) => (
                <motion.div
                  key={d.depositCode}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: EASE,
                    delay: i * 0.06,
                  }}
                >
                  <Link
                    href={`/deposito-bagagli/deposito/${encodeURIComponent(d.depositCode)}`}
                    className="group block rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-cyan-500/30 hover:bg-white/[0.07]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-white">
                          {d.depositCode}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {new Date(d.bookingDate).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          &middot; {d.bagCount}{" "}
                          {d.bagCount === 1 ? "borsa" : "borse"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[d.status] ?? STATUS_BADGE.PRENOTATO}`}
                        >
                          {STATUS_LABEL[d.status] ?? d.status}
                        </span>
                        {d.totalAmount != null && (
                          <span className="text-sm font-semibold text-white">
                            {d.totalAmount
                              .toFixed(2)
                              .replace(".", ",")}{" "}
                            {d.currency ?? "EUR"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => fetchDeposits(page - 1)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Pagina precedente"
                  >
                    Precedente
                  </button>
                  <span className="text-sm text-slate-400">
                    Pagina {page} di {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => fetchDeposits(page + 1)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Pagina successiva"
                  >
                    Successiva
                  </button>
                </div>
              )}
            </div>
          )}
        </Container>
      )}

      {/* ── Back link ─────────────────────────────────────────────── */}
      <Container className="mt-12 text-center">
        <FadeUp delay={0.1}>
          <Link
            href="/deposito-bagagli"
            className="text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 transition hover:text-cyan-300"
          >
            Prenota un nuovo deposito
          </Link>
        </FadeUp>
      </Container>
    </main>
  );
}
