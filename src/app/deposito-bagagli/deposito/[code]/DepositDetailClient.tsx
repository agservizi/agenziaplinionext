"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

type DepositDetail = {
  depositCode: string;
  status: DepositStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bagCount: number;
  bagTags?: string[];
  bookingDate: string;
  expectedCheckIn?: string;
  expectedCheckOut?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  notes?: string;
  dailyRate: number;
  totalAmount: number;
  currency: string;
  qrToken?: string;
  createdAt: string;
  updatedAt: string;
};

type PageState = "loading" | "ready" | "error" | "not-found";

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

/* ─── Detail row helper ────────────────────────────────────────────── */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="min-w-[140px] text-sm font-medium text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-white">{value}</dd>
    </div>
  );
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function DepositDetailClient({ code }: { code: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [deposit, setDeposit] = useState<DepositDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  /* Edit mode */
  const [editing, setEditing] = useState(false);
  const [editBagCount, setEditBagCount] = useState(1);
  const [editBookingDate, setEditBookingDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  /* Cancel */
  const [cancelLoading, setCancelLoading] = useState(false);

  /* ── Fetch deposit ──────────────────────────────────────────────── */

  const fetchDeposit = useCallback(async () => {
    setPageState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/deposito-bagagli/deposits/${encodeURIComponent(code)}`,
      );
      const json = await res.json();

      if (res.status === 404) {
        setPageState("not-found");
        return;
      }
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message ?? "Errore nel caricamento.");
      }

      const raw = json.data ?? json;
      const data: DepositDetail = {
        ...raw,
        depositCode: raw.depositCode ?? raw.code ?? code,
        bagCount: Number(raw.bagCount ?? raw.bag_count ?? 0),
        totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? raw.total ?? 0),
        currency: raw.currency ?? "EUR",
        status: raw.status ?? "PRENOTATO",
        bookingDate: raw.bookingDate ?? raw.booking_date ?? "",
        customerName: raw.customerName ?? raw.customer_name ?? "",
        customerEmail: raw.customerEmail ?? raw.customer_email ?? "",
        notes: raw.notes ?? "",
      };
      setDeposit(data);
      setEditBagCount(data.bagCount);
      setEditBookingDate(data.bookingDate);
      setEditNotes(data.notes);
      setPageState("ready");
    } catch (err) {
      setPageState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Errore. Riprova.",
      );
    }
  }, [code]);

  useEffect(() => {
    fetchDeposit();
  }, [fetchDeposit]);

  /* ── Cancel handler ─────────────────────────────────────────────── */

  async function handleCancel() {
    if (!confirm("Sei sicuro di voler annullare la prenotazione?")) return;
    setCancelLoading(true);
    try {
      const res = await fetch(
        `/api/deposito-bagagli/deposits/${encodeURIComponent(code)}/cancel`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message ?? "Cancellazione non riuscita.");
      }
      router.push("/deposito-bagagli/i-miei-depositi");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Errore nella cancellazione.",
      );
    } finally {
      setCancelLoading(false);
    }
  }

  /* ── Edit handler ───────────────────────────────────────────────── */

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const body: Record<string, unknown> = {};
      if (editBagCount !== deposit?.bagCount) body.bagCount = editBagCount;
      if (editBookingDate !== deposit?.bookingDate)
        body.bookingDate = editBookingDate;
      if (editNotes !== (deposit?.notes ?? "")) body.notes = editNotes;

      if (Object.keys(body).length === 0) {
        setEditing(false);
        setEditLoading(false);
        return;
      }

      const res = await fetch(
        `/api/deposito-bagagli/deposits/${encodeURIComponent(code)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message ?? "Modifica non riuscita.");
      }

      setEditing(false);
      await fetchDeposit();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Errore nella modifica.",
      );
    } finally {
      setEditLoading(false);
    }
  }

  /* ── Render: loading / error / not found ────────────────────────── */

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Caricamento deposito...</p>
      </main>
    );
  }

  if (pageState === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <Container className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Deposito non trovato
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Il codice <span className="font-mono text-cyan-400">{code}</span>{" "}
            non corrisponde a nessun deposito.
          </p>
          <Link
            href="/deposito-bagagli/i-miei-depositi"
            className="mt-6 inline-block text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-300"
          >
            Torna ai miei depositi
          </Link>
        </Container>
      </main>
    );
  }

  if (pageState === "error" || !deposit) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <Container className="text-center">
          <p className="text-sm text-rose-300" role="alert">
            {errorMsg || "Errore nel caricamento."}
          </p>
          <button
            onClick={fetchDeposit}
            className="mt-4 text-sm text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
          >
            Riprova
          </button>
        </Container>
      </main>
    );
  }

  /* ── Render: detail ─────────────────────────────────────────────── */

  const isPrenotato = deposit.status === "PRENOTATO";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      <Container>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto max-w-2xl"
        >
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Codice deposito
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-wider text-white sm:text-4xl">
                {deposit.depositCode}
              </h1>
            </div>
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_BADGE[deposit.status] ?? STATUS_BADGE.PRENOTATO}`}
            >
              {STATUS_LABEL[deposit.status] ?? deposit.status}
            </span>
          </div>

          {/* Detail card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <dl className="space-y-4">
              <DetailRow label="Cliente" value={deposit.customerName} />
              <DetailRow label="Email" value={deposit.customerEmail} />
              {deposit.customerPhone && (
                <DetailRow label="Telefono" value={deposit.customerPhone} />
              )}
              <DetailRow
                label="Data deposito"
                value={new Date(deposit.bookingDate).toLocaleDateString(
                  "it-IT",
                  { day: "2-digit", month: "long", year: "numeric" },
                )}
              />
              <DetailRow
                label="Borse"
                value={
                  <span>
                    {deposit.bagCount}{" "}
                    {deposit.bagCount === 1 ? "borsa" : "borse"}
                    {deposit.bagTags && deposit.bagTags.length > 0 && (
                      <span className="ml-2 inline-flex flex-wrap gap-1">
                        {deposit.bagTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                }
              />
              {deposit.expectedCheckIn && (
                <DetailRow
                  label="Check-in previsto"
                  value={deposit.expectedCheckIn}
                />
              )}
              {deposit.expectedCheckOut && (
                <DetailRow
                  label="Check-out previsto"
                  value={deposit.expectedCheckOut}
                />
              )}
              {deposit.actualCheckIn && (
                <DetailRow
                  label="Check-in effettivo"
                  value={deposit.actualCheckIn}
                />
              )}
              {deposit.actualCheckOut && (
                <DetailRow
                  label="Check-out effettivo"
                  value={deposit.actualCheckOut}
                />
              )}
              {deposit.notes && (
                <DetailRow label="Note" value={deposit.notes} />
              )}

              {/* Pricing breakdown */}
              <div className="border-t border-white/10 pt-4">
                <DetailRow
                  label="Tariffa giornaliera"
                  value={`${deposit.dailyRate.toFixed(2).replace(".", ",")} ${deposit.currency}`}
                />
                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt className="min-w-[140px] text-sm font-semibold text-slate-300">
                    Totale
                  </dt>
                  <dd className="text-lg font-bold text-white">
                    {deposit.totalAmount.toFixed(2).replace(".", ",")}{" "}
                    {deposit.currency}
                  </dd>
                </div>
              </div>

              {/* QR token */}
              {deposit.qrToken && (
                <div className="border-t border-white/10 pt-4">
                  <DetailRow
                    label="QR Token"
                    value={
                      <code className="rounded-md bg-slate-800 px-2 py-1 text-xs text-cyan-400">
                        {deposit.qrToken}
                      </code>
                    }
                  />
                </div>
              )}
            </dl>
          </div>

          {/* ── Actions for PRENOTATO ─────────────────────────────── */}
          {isPrenotato && !editing && (
            <FadeUp delay={0.1}>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Modifica
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="rounded-full border border-rose-500/30 bg-rose-500/10 px-6 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelLoading
                    ? "Cancellazione..."
                    : "Cancella prenotazione"}
                </button>
              </div>
            </FadeUp>
          )}

          {/* ── Edit form ─────────────────────────────────────────── */}
          {isPrenotato && editing && (
            <FadeUp delay={0.05}>
              <form
                onSubmit={handleEdit}
                className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <h3 className="mb-4 text-lg font-bold text-white">
                  Modifica prenotazione
                </h3>

                <div className="space-y-4">
                  <label className="block space-y-2 text-sm text-slate-200">
                    Numero borse
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editBagCount}
                      onChange={(e) =>
                        setEditBagCount(Number(e.target.value))
                      }
                      className={INPUT_CLASS}
                      aria-label="Numero borse"
                    />
                  </label>

                  <label className="block space-y-2 text-sm text-slate-200">
                    Data deposito
                    <input
                      type="date"
                      min={today}
                      value={editBookingDate}
                      onChange={(e) => setEditBookingDate(e.target.value)}
                      className={INPUT_CLASS}
                      aria-label="Data deposito"
                    />
                  </label>

                  <label className="block space-y-2 text-sm text-slate-200">
                    Note (opzionale)
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className={INPUT_CLASS}
                      aria-label="Note"
                    />
                  </label>
                </div>

                {editError && (
                  <p role="alert" className="mt-3 text-sm text-rose-300">
                    {editError}
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40"
                  >
                    {editLoading ? "Salvataggio..." : "Salva modifiche"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditError("");
                    }}
                    className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </FadeUp>
          )}

          {/* ── Back link ─────────────────────────────────────────── */}
          <div className="mt-10 text-center">
            <Link
              href="/deposito-bagagli/i-miei-depositi"
              className="text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 transition hover:text-cyan-300"
            >
              Torna ai miei depositi
            </Link>
          </div>
        </motion.div>
      </Container>
    </main>
  );
}
