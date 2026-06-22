"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";

/* ─── Types ────────────────────────────────────────────────────────── */

type DepositStatus =
  | "PRENOTATO"
  | "CHECK_IN"
  | "COMPLETATO"
  | "ANNULLATO"
  | "NO_SHOW";

type VerifyData = {
  depositCode: string;
  status: DepositStatus;
  customerName: string;
  bagCount: number;
  bookingDate: string;
  expectedCheckIn?: string;
  expectedCheckOut?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
};

type PageState = "loading" | "ready" | "error" | "no-token";

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

const VERIFY_API_BASE = "/api/deposito-bagagli/verify";

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

export default function VerificaClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const reduced = useReducedMotion();

  const [pageState, setPageState] = useState<PageState>(
    token ? "loading" : "no-token",
  );
  const [data, setData] = useState<VerifyData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setPageState("no-token");
      return;
    }

    let cancelled = false;

    (async () => {
      setPageState("loading");
      try {
        const res = await fetch(
          `${VERIFY_API_BASE}?token=${encodeURIComponent(token)}`,
        );
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || json.success === false) {
          throw new Error(
            json.error?.message ?? "Token non valido o scaduto.",
          );
        }

        setData(json.data ?? json);
        setPageState("ready");
      } catch (err) {
        if (cancelled) return;
        setPageState("error");
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Errore nella verifica. Riprova.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* ── No token ───────────────────────────────────────────────────── */

  if (pageState === "no-token") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <Container className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Verifica deposito
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Nessun token fornito. Scansiona il QR code per verificare un
            deposito.
          </p>
          <Link
            href="/deposito-bagagli"
            className="mt-6 inline-block text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-300"
          >
            Torna al deposito bagagli
          </Link>
        </Container>
      </main>
    );
  }

  /* ── Loading ────────────────────────────────────────────────────── */

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Verifica in corso...</p>
      </main>
    );
  }

  /* ── Error ──────────────────────────────────────────────────────── */

  if (pageState === "error" || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <Container className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-500/30">
            <svg
              className="h-8 w-8 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Verifica non riuscita
          </h1>
          <p className="mt-3 text-sm text-rose-300" role="alert">
            {errorMsg}
          </p>
          <Link
            href="/deposito-bagagli"
            className="mt-6 inline-block text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-300"
          >
            Torna al deposito bagagli
          </Link>
        </Container>
      </main>
    );
  }

  /* ── Verified ───────────────────────────────────────────────────── */

  return (
    <main className="flex min-h-screen items-center bg-slate-950 py-32">
      <Container>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto max-w-lg"
        >
          {/* Success icon */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <svg
                className="h-8 w-8 text-emerald-400"
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
            <h1 className="text-2xl font-bold text-white">
              Deposito verificato
            </h1>
          </div>

          {/* Detail card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-2xl font-extrabold tracking-wider text-cyan-400">
                {data.depositCode}
              </p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[data.status] ?? STATUS_BADGE.PRENOTATO}`}
              >
                {STATUS_LABEL[data.status] ?? data.status}
              </span>
            </div>

            <dl className="space-y-3">
              <DetailRow label="Cliente" value={data.customerName} />
              <DetailRow
                label="Data"
                value={new Date(data.bookingDate).toLocaleDateString(
                  "it-IT",
                  { day: "2-digit", month: "long", year: "numeric" },
                )}
              />
              <DetailRow
                label="Borse"
                value={`${data.bagCount} ${data.bagCount === 1 ? "borsa" : "borse"}`}
              />
              {data.expectedCheckIn && (
                <DetailRow
                  label="Check-in previsto"
                  value={data.expectedCheckIn}
                />
              )}
              {data.expectedCheckOut && (
                <DetailRow
                  label="Check-out previsto"
                  value={data.expectedCheckOut}
                />
              )}
              {data.actualCheckIn && (
                <DetailRow
                  label="Check-in effettivo"
                  value={data.actualCheckIn}
                />
              )}
              {data.actualCheckOut && (
                <DetailRow
                  label="Check-out effettivo"
                  value={data.actualCheckOut}
                />
              )}
            </dl>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/deposito-bagagli"
              className="text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 transition hover:text-cyan-300"
            >
              Torna al deposito bagagli
            </Link>
          </div>
        </motion.div>
      </Container>
    </main>
  );
}
