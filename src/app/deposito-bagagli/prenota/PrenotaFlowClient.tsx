"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/Container";

/* ─── Types ────────────────────────────────────────────────────────── */

type PricingData = {
  dailyRate: number;
  currency: string;
  maxBagsPerBooking: number;
  maxDaysAdvance: number;
  operatingHours: { open: string; close: string };
  capacity: number;
};

type Step = 1 | 2 | 3;
type FormState = "idle" | "loading" | "error";

/* ─── Constants ────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEPS = [
  { num: 1 as const, label: "Riepilogo" },
  { num: 2 as const, label: "Dati" },
  { num: 3 as const, label: "Conferma" },
];

const INPUT_CLASS =
  "w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-500";

/* ─── Helpers ──────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function calcDays(checkin: string, checkout: string): number {
  try {
    const a = new Date(checkin + "T00:00:00");
    const b = new Date(checkout + "T00:00:00");
    const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
    return diff >= 1 ? diff : 1;
  } catch {
    return 1;
  }
}

function fmtPrice(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/* ─── Step Indicator ──────────────────────────────────────────────── */

function StepIndicator({
  current,
  onNavigate,
}: {
  current: Step;
  onNavigate: (step: Step) => void;
}) {
  return (
    <nav aria-label="Passaggi prenotazione" className="mb-10">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, idx) => {
          const isCompleted = step.num < current;
          const isCurrent = step.num === current;
          const isClickable = step.num < current;

          return (
            <li key={step.num} className="flex items-center gap-2 sm:gap-4">
              {idx > 0 && (
                <div
                  className={`h-px w-6 sm:w-10 ${
                    isCompleted ? "bg-cyan-400" : "bg-white/10"
                  }`}
                />
              )}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onNavigate(step.num)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  isCurrent
                    ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30"
                    : isCompleted
                      ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 cursor-pointer hover:bg-emerald-500/25"
                      : "text-slate-500 cursor-default"
                }`}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Passaggio ${step.num}: ${step.label}${isCompleted ? " (completato)" : ""}`}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  <span>{step.num}</span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function PrenotaFlowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  /* ── Read search params ─────────────────────────────────────────── */

  const checkin = searchParams.get("checkin") ?? "";
  const checkinTime = searchParams.get("checkinTime") ?? "";
  const checkout = searchParams.get("checkout") ?? "";
  const checkoutTime = searchParams.get("checkoutTime") ?? "";
  const bags = Number(searchParams.get("bags") || 0);
  const small = Number(searchParams.get("small") || 0);
  const medium = Number(searchParams.get("medium") || 0);
  const large = Number(searchParams.get("large") || 0);
  const backpacks = Number(searchParams.get("backpacks") || 0);

  const totalBags = bags || small + medium + large + backpacks || 1;
  const hasMissingParams = !checkin || !checkout;

  /* ── Step state ─────────────────────────────────────────────────── */

  const [step, setStep] = useState<Step>(1);
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState("");

  /* ── Customer data ──────────────────────────────────────────────── */

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  /* ── Pricing ────────────────────────────────────────────────────── */

  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [pricingError, setPricingError] = useState("");

  /* Focus management ref */
  const stepContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/deposito-bagagli/pricing");
        const json = await res.json();
        if (!cancelled) {
          if (json.success === false) {
            setPricingError(
              json.error?.message ?? "Impossibile caricare i prezzi.",
            );
          } else {
            setPricing(json.data ?? json);
          }
        }
      } catch {
        if (!cancelled)
          setPricingError("Servizio momentaneamente non disponibile.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Derived values ─────────────────────────────────────────────── */

  const days = calcDays(checkin, checkout);
  const totalPrice = pricing ? pricing.dailyRate * totalBags * days : 0;

  /* ── Bag breakdown for notes ────────────────────────────────────── */

  const bagBreakdownParts: string[] = [];
  if (small > 0) bagBreakdownParts.push(`Valigie piccole: ${small}`);
  if (medium > 0) bagBreakdownParts.push(`Medie: ${medium}`);
  if (large > 0) bagBreakdownParts.push(`Grandi: ${large}`);
  if (backpacks > 0) bagBreakdownParts.push(`Zaini: ${backpacks}`);
  const bagBreakdownNote =
    bagBreakdownParts.length > 0
      ? bagBreakdownParts.join(", ")
      : `Bagagli: ${totalBags}`;

  /* ── Navigation ─────────────────────────────────────────────────── */

  const goToStep = useCallback(
    (s: Step) => {
      setStep(s);
      // Move focus to step content for screen readers
      setTimeout(() => {
        stepContainerRef.current?.focus();
      }, 100);
    },
    [],
  );

  const canGoStep2 = !hasMissingParams && pricing !== null;
  const canGoStep3 =
    customerName.trim() !== "" && customerEmail.trim() !== "";

  /* ── Submit ─────────────────────────────────────────────────────── */

  async function handleSubmit() {
    if (formState === "loading" || !acceptTerms) return;
    setFormState("loading");
    setFormError("");

    try {
      const combinedNotes = [bagBreakdownNote, notes].filter(Boolean).join(". ");
      const payload: Record<string, unknown> = {
        customerName,
        customerEmail,
        bagCount: totalBags,
        bookingDate: checkin,
        expectedCheckIn: checkinTime || undefined,
        expectedCheckOut: checkout + (checkoutTime ? `T${checkoutTime}` : ""),
        notes: combinedNotes || undefined,
      };
      if (customerPhone) payload.customerPhone = customerPhone;

      // Remove undefined values
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });

      const res = await fetch("/api/deposito-bagagli/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(
          json.error?.message ?? "Prenotazione non riuscita. Riprova.",
        );
      }

      const code =
        json.data?.depositCode ?? json.depositCode ?? json.data?.code ?? "";
      router.push(
        `/deposito-bagagli/conferma?code=${encodeURIComponent(code)}`,
      );
    } catch (err) {
      setFormState("error");
      setFormError(
        err instanceof Error
          ? err.message
          : "Si e verificato un errore. Riprova piu tardi.",
      );
    }
  }

  /* ── Animation variants ─────────────────────────────────────────── */

  const pageVariants = reduced
    ? {}
    : {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
      };

  /* ── Missing params ─────────────────────────────────────────────── */

  if (hasMissingParams) {
    return (
      <main className="flex min-h-screen items-center bg-slate-950 py-32">
        <Container className="text-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto max-w-md"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
              <svg
                className="h-8 w-8 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Parametri mancanti
            </h1>
            <p className="mt-4 text-base text-slate-400">
              Non abbiamo trovato i dettagli della prenotazione. Torna alla
              ricerca per selezionare date e bagagli.
            </p>
            <Link
              href="/deposito-bagagli"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Torna alla ricerca
            </Link>
          </motion.div>
        </Container>
      </main>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* ── Header ───────────────────────────────────────────── */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-8 text-center"
          >
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-cyan-400">
              Prenotazione deposito
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Completa la prenotazione
            </h1>
          </motion.div>

          {/* ── Step indicator ────────────────────────────────────── */}
          <StepIndicator current={step} onNavigate={goToStep} />

          {/* ── Step content ──────────────────────────────────────── */}
          <div
            ref={stepContainerRef}
            tabIndex={-1}
            className="outline-none"
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              {/* ═══ Step 1: Riepilogo prenotazione ═══════════════ */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  {...pageVariants}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
                    <h2 className="mb-6 text-xl font-bold text-white">
                      Riepilogo prenotazione
                    </h2>

                    {pricingError && (
                      <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                        <p className="text-sm text-rose-300" role="alert">
                          {pricingError}
                        </p>
                      </div>
                    )}

                    {/* Location */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0Z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-slate-500">Deposito</p>
                          <p className="text-sm font-medium text-white">
                            AG SERVIZI - Via Plinio il Vecchio 72, Castellammare
                            di Stabia (NA)
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-slate-500">Date</p>
                          <p className="text-sm font-medium text-white">
                            Check-in: {formatDate(checkin)}
                            {checkinTime ? ` alle ${checkinTime}` : ""}
                          </p>
                          <p className="text-sm font-medium text-white">
                            Check-out: {formatDate(checkout)}
                            {checkoutTime ? ` alle ${checkoutTime}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {days} {days === 1 ? "giorno" : "giorni"}
                          </p>
                        </div>
                      </div>

                      {/* Bags */}
                      <div className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-slate-500">Bagagli</p>
                          <p className="text-sm font-medium text-white">
                            {totalBags}{" "}
                            {totalBags === 1 ? "bagaglio" : "bagagli"}
                          </p>
                          {bagBreakdownParts.length > 0 && (
                            <p className="text-xs text-slate-500">
                              {bagBreakdownNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    {pricing && (
                      <>
                        <div className="my-6 h-px bg-white/10" />
                        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">
                              {fmtPrice(pricing.dailyRate)} {pricing.currency}{" "}
                              x {totalBags}{" "}
                              {totalBags === 1 ? "borsa" : "borse"} x {days}{" "}
                              {days === 1 ? "giorno" : "giorni"}
                            </span>
                            <span className="font-semibold text-white">
                              {fmtPrice(totalPrice)} {pricing.currency}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                            <span className="font-semibold text-white">
                              Totale
                            </span>
                            <span className="text-lg font-bold text-cyan-400">
                              {fmtPrice(totalPrice)} {pricing.currency}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* CTA */}
                    <button
                      type="button"
                      disabled={!canGoStep2}
                      onClick={() => goToStep(2)}
                      className="mt-8 w-full rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40 disabled:text-slate-950/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                    >
                      Continua
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ Step 2: Dati cliente ═════════════════════════ */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  {...pageVariants}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
                    <h2 className="mb-6 text-xl font-bold text-white">
                      Dati cliente
                    </h2>

                    <div className="space-y-5">
                      {/* Nome */}
                      <label className="block space-y-2 text-sm text-slate-200">
                        Nome e cognome *
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className={INPUT_CLASS}
                          aria-label="Nome e cognome"
                          placeholder="Mario Rossi"
                          autoFocus
                        />
                      </label>

                      {/* Email */}
                      <label className="block space-y-2 text-sm text-slate-200">
                        Email *
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className={INPUT_CLASS}
                          aria-label="Email"
                          placeholder="mario@email.com"
                        />
                      </label>

                      {/* Telefono */}
                      <label className="block space-y-2 text-sm text-slate-200">
                        Telefono (opzionale)
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={INPUT_CLASS}
                          aria-label="Telefono"
                          placeholder="+39 333 1234567"
                        />
                      </label>

                      {/* Note */}
                      <label className="block space-y-2 text-sm text-slate-200">
                        Note (opzionale)
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className={INPUT_CLASS}
                          aria-label="Note aggiuntive"
                          placeholder="Informazioni aggiuntive sul deposito..."
                        />
                      </label>
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 flex gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                      >
                        Indietro
                      </button>
                      <button
                        type="button"
                        disabled={!canGoStep3}
                        onClick={() => goToStep(3)}
                        className="flex-1 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40 disabled:text-slate-950/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                      >
                        Continua
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ Step 3: Riepilogo e conferma ═════════════════ */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  {...pageVariants}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
                    <h2 className="mb-6 text-xl font-bold text-white">
                      Riepilogo e conferma
                    </h2>

                    {/* Summary sections */}
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Deposito
                        </p>
                        <p className="text-sm font-medium text-white">
                          AG SERVIZI - Via Plinio il Vecchio 72
                        </p>
                        <p className="text-sm text-slate-400">
                          80053 Castellammare di Stabia (NA)
                        </p>
                      </div>

                      {/* Dates */}
                      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Date e orari
                        </p>
                        <p className="text-sm text-white">
                          Check-in: {formatDate(checkin)}
                          {checkinTime ? ` alle ${checkinTime}` : ""}
                        </p>
                        <p className="text-sm text-white">
                          Check-out: {formatDate(checkout)}
                          {checkoutTime ? ` alle ${checkoutTime}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Durata: {days}{" "}
                          {days === 1 ? "giorno" : "giorni"}
                        </p>
                      </div>

                      {/* Bags */}
                      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Bagagli
                        </p>
                        <p className="text-sm text-white">
                          {totalBags}{" "}
                          {totalBags === 1 ? "bagaglio" : "bagagli"}
                        </p>
                        {bagBreakdownParts.length > 0 && (
                          <p className="text-xs text-slate-500">
                            {bagBreakdownNote}
                          </p>
                        )}
                      </div>

                      {/* Customer */}
                      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Dati cliente
                        </p>
                        <p className="text-sm text-white">{customerName}</p>
                        <p className="text-sm text-slate-400">
                          {customerEmail}
                        </p>
                        {customerPhone && (
                          <p className="text-sm text-slate-400">
                            {customerPhone}
                          </p>
                        )}
                        {notes && (
                          <p className="mt-2 text-sm text-slate-500">
                            Note: {notes}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      {pricing && (
                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                            Totale
                          </p>
                          <p className="text-2xl font-bold text-cyan-400">
                            {fmtPrice(totalPrice)} {pricing.currency}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {fmtPrice(pricing.dailyRate)} {pricing.currency} x{" "}
                            {totalBags}{" "}
                            {totalBags === 1 ? "borsa" : "borse"} x {days}{" "}
                            {days === 1 ? "giorno" : "giorni"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Terms checkbox */}
                    <div className="mt-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900/60 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-950"
                          aria-label="Accetto i termini del servizio"
                        />
                        <span className="text-sm text-slate-300">
                          Accetto i termini del servizio di deposito bagagli di
                          AG SERVIZI
                        </span>
                      </label>
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                        <p className="text-sm text-rose-300" role="alert">
                          {formError}
                        </p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-8 flex gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                      >
                        Indietro
                      </button>
                      <button
                        type="button"
                        disabled={
                          !acceptTerms || formState === "loading"
                        }
                        onClick={handleSubmit}
                        className="flex-1 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40 disabled:text-slate-950/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                      >
                        {formState === "loading"
                          ? "Prenotazione in corso..."
                          : "Conferma prenotazione"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Back link ─────────────────────────────────────────── */}
          <div className="mt-8 text-center">
            <Link
              href="/deposito-bagagli"
              className="text-sm text-slate-500 transition hover:text-slate-400"
            >
              Annulla e torna alla ricerca
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
