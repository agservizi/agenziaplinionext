/**
 * Callers: /deposito-bagagli/i-miei-depositi page.
 * API: GET /api/deposito-bagagli/deposits?email=
 * User: "/deposito-bagagli/i-miei-depositi e /fermo-deposito/i-miei-pacchi non sono in brutal editorial"
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

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

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STATUS_LABEL: Record<DepositStatus, string> = {
  PRENOTATO: "Prenotato",
  CHECK_IN: "Check-in",
  COMPLETATO: "Completato",
  ANNULLATO: "Annullato",
  NO_SHOW: "No show",
};

const INPUT_CLASS =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";

const CTA_CLASS =
  "brutal-cta-ink inline-flex shrink-0 items-center justify-center bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

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
      const raw = await res.text();
      let json: Record<string, unknown> = {};
      try {
        json = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      } catch {
        throw new Error(raw.slice(0, 140) || "Impossibile recuperare i depositi.");
      }

      if (!res.ok || json.success === false) {
        const err = json.error as { message?: string } | undefined;
        throw new Error(err?.message ?? "Impossibile recuperare i depositi.");
      }

      const wrapper = (json.data ?? json) as Record<string, unknown>;
      const list = Array.isArray(wrapper)
        ? wrapper
        : ((wrapper.deposits ?? wrapper.items ?? wrapper.results ?? []) as Record<
            string,
            unknown
          >[]);
      const mapped: DepositSummary[] = list.map((d) => ({
        depositCode: String(d.depositCode ?? d.code ?? d.deposit_code ?? ""),
        bookingDate: String(d.bookingDate ?? d.booking_date ?? d.date ?? ""),
        bagCount: Number(d.bagCount ?? d.bag_count ?? d.bags ?? 0),
        status: (d.status ?? "PRENOTATO") as DepositStatus,
        totalAmount: Number(d.totalAmount ?? d.total_amount ?? d.total ?? 0),
        currency: String(d.currency ?? "EUR"),
      }));
      setDeposits(mapped);
      const meta = (json.meta ?? wrapper.meta) as { total?: number } | undefined;
      setTotal(meta?.total ?? mapped.length);
      setPage(pageNum);
      setFetchState("done");
    } catch (err) {
      setFetchState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Si e verificato un errore. Riprova.",
      );
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void fetchDeposits(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40"
        >
          Deposito bagagli
        </motion.p>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: EASE, duration: 0.55 }}
          className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]"
        >
          I miei depositi
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Inserisci la tua email per vedere le prenotazioni e lo stato di ogni deposito.
        </p>
        <Link
          href="/deposito-bagagli"
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7] hover:underline"
        >
          Prenota un nuovo deposito
        </Link>
      </section>

      <section className="px-5 py-8 md:px-8">
        <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="block flex-1">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Email
            </span>
            <input
              id="deposit-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder="tua@email.it"
              aria-label="Indirizzo email"
            />
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={fetchState === "loading"} className={CTA_CLASS}>
              {fetchState === "loading" ? "Ricerca..." : "Cerca"}
            </button>
          </div>
        </form>

        {errorMsg ? (
          <p role="alert" className="mt-5 text-sm font-medium text-red-600">
            {errorMsg}
          </p>
        ) : null}

        {fetchState === "done" ? (
          <div className="mt-8">
            {deposits.length === 0 ? (
              <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 text-sm text-[var(--ink)]/55">
                Nessun deposito trovato per questa email.
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
                    Risultati
                  </p>
                  <span className="border border-[var(--ink)]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
                    {total} depositi
                  </span>
                </div>
                <div className="border border-[var(--ink)]/12">
                  {deposits.map((d, i) => (
                    <motion.div
                      key={d.depositCode}
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                      className="border-t border-[var(--ink)]/10 first:border-t-0"
                    >
                      <Link
                        href={`/deposito-bagagli/deposito/${encodeURIComponent(d.depositCode)}`}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-[color-mix(in_srgb,var(--paper)_90%,white)]"
                      >
                        <div>
                          <p className="text-base font-semibold text-[var(--ink)]">
                            {d.depositCode}
                          </p>
                          <p className="mt-1 text-sm text-[var(--ink)]/55">
                            {d.bookingDate
                              ? new Date(d.bookingDate).toLocaleDateString("it-IT", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Data n/d"}{" "}
                            · {d.bagCount} {d.bagCount === 1 ? "borsa" : "borse"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="border border-[var(--ink)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/60">
                            {STATUS_LABEL[d.status] ?? d.status}
                          </span>
                          {d.totalAmount != null ? (
                            <span className="text-sm font-semibold text-[var(--ink)]">
                              {d.totalAmount.toFixed(2).replace(".", ",")} {d.currency || "EUR"}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => void fetchDeposits(page - 1)}
                      className="border border-[var(--ink)]/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/70 transition hover:border-[#5E0ED7] hover:text-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Pagina precedente"
                    >
                      Precedente
                    </button>
                    <span className="text-sm text-[var(--ink)]/45">
                      Pagina {page} di {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => void fetchDeposits(page + 1)}
                      className="border border-[var(--ink)]/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/70 transition hover:border-[#5E0ED7] hover:text-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Pagina successiva"
                    >
                      Successiva
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
