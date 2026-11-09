"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/Container";

/* ─── Types ────────────────────────────────────────────────────────── */

type PricingData = {
  dailyRate: number;
  currency: string;
  maxBagsPerBooking: number;
  maxDaysAdvance: number;
  operatingHours: { open: string; close: string } | null;
  capacity: number;
};

/** Callers: DepositoBookingClient + area-clienti/deposito-bagagli. API: /api/deposito-bagagli/pricing (Gestiio: dailyRate, maxDailyCapacity; no operatingHours). User: Cannot read properties of undefined (reading 'open') */
function normalizePricing(raw: Record<string, unknown>): PricingData {
  const hours = (raw.operatingHours ?? raw.operating_hours) as
    | { open?: string; close?: string }
    | null
    | undefined;
  return {
    dailyRate: Number(raw.dailyRate ?? raw.daily_rate ?? 0),
    currency: String(raw.currency ?? "EUR"),
    maxBagsPerBooking: Number(raw.maxBagsPerBooking ?? raw.max_bags_per_booking ?? 10),
    maxDaysAdvance: Number(raw.maxDaysAdvance ?? raw.max_days_advance ?? 30),
    operatingHours:
      hours?.open && hours?.close
        ? { open: String(hours.open), close: String(hours.close) }
        : null,
    capacity: Number(
      raw.capacity ?? raw.maxDailyCapacity ?? raw.max_daily_capacity ?? 0,
    ),
  };
}

type AvailabilityData = {
  date: string;
  available: boolean;
  spotsLeft: number;
  capacity: number;
};

type FormState = "idle" | "loading" | "success" | "error";

/* ─── Constants ────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const INPUT_CLASS_PUBLIC =
  "w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-500";

const INPUT_CLASS_CLIENT =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";

const CTA_CLIENT =
  "brutal-cta-ink w-full bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

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

type DepositoBookingClientProps = {
  tone?: "public" | "client";
};

export default function DepositoBookingClient({
  tone = "public",
}: DepositoBookingClientProps) {
  const router = useRouter();
  const isClient = tone === "client";
  const inputClass = isClient ? INPUT_CLASS_CLIENT : INPUT_CLASS_PUBLIC;

  /* Pricing */
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [pricingError, setPricingError] = useState("");

  /* Availability */
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );
  const [availLoading, setAvailLoading] = useState(false);

  /* Form */
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bagCount, setBagCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [expectedCheckIn, setExpectedCheckIn] = useState("");
  const [expectedCheckOut, setExpectedCheckOut] = useState("");
  const [notes, setNotes] = useState("");

  /* ── Fetch pricing on mount ─────────────────────────────────────── */

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
            const raw = (json.data ?? json) as Record<string, unknown>;
            setPricing(normalizePricing(raw));
          }
        }
      } catch {
        if (!cancelled) setPricingError("Servizio momentaneamente non disponibile.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Check availability when date changes ───────────────────────── */

  const checkAvailability = useCallback(async (date: string) => {
    if (!date) {
      setAvailability(null);
      return;
    }
    setAvailLoading(true);
    try {
      const res = await fetch(
        `/api/deposito-bagagli/availability?date=${encodeURIComponent(date)}`,
      );
      const json = await res.json();
      if (json.success === false) {
        setAvailability(null);
      } else {
        setAvailability(json.data ?? json);
      }
    } catch {
      setAvailability(null);
    } finally {
      setAvailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bookingDate) {
      checkAvailability(bookingDate);
    } else {
      setAvailability(null);
    }
  }, [bookingDate, checkAvailability]);

  /* ── Submit ─────────────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "loading") return;

    setFormState("loading");
    setFormError("");

    try {
      const payload: Record<string, unknown> = {
        customerName,
        customerEmail,
        bagCount,
        bookingDate,
      };
      if (customerPhone) payload.customerPhone = customerPhone;
      if (expectedCheckIn) payload.expectedCheckIn = expectedCheckIn;
      if (expectedCheckOut) payload.expectedCheckOut = expectedCheckOut;
      if (notes) payload.notes = notes;

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

      setFormState("success");
      const code =
        json.data?.depositCode ?? json.depositCode ?? json.data?.code ?? "";
      router.push(`/deposito-bagagli/conferma?code=${encodeURIComponent(code)}`);
    } catch (err) {
      setFormState("error");
      setFormError(
        err instanceof Error
          ? err.message
          : "Si e verificato un errore. Riprova piu tardi.",
      );
    }
  }

  /* ── Helpers ────────────────────────────────────────────────────── */

  const today = new Date().toISOString().slice(0, 10);
  const maxDate =
    pricing?.maxDaysAdvance
      ? new Date(Date.now() + pricing.maxDaysAdvance * 86400000)
          .toISOString()
          .slice(0, 10)
      : undefined;

  const isDateUnavailable =
    availability !== null && !availability.available;

  const canSubmit =
    formState !== "loading" &&
    customerName.trim() !== "" &&
    customerEmail.trim() !== "" &&
    bagCount >= 1 &&
    bookingDate !== "" &&
    !isDateUnavailable;

  /* ── Render ─────────────────────────────────────────────────────── */

  const labelWrap = isClient
    ? "block space-y-1.5"
    : "space-y-2 text-sm text-slate-200";
  const labelText = isClient
    ? "block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45"
    : "";

  const pricingCardClass = isClient
    ? "border border-[var(--ink)]/12 bg-[var(--paper)] p-5 text-center"
    : "rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md";

  const pricingLabelClass = isClient
    ? "text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45"
    : "text-sm font-medium text-slate-400";

  const pricingValueClass = isClient
    ? "mt-2 text-2xl font-bold text-[var(--ink)]"
    : "mt-2 text-3xl font-bold text-white";

  const pricingUnitClass = isClient
    ? "text-sm text-[var(--ink)]/50"
    : "text-lg text-slate-400";

  const formPanelClass = isClient
    ? "border border-[var(--ink)]/12 bg-[var(--paper)] p-5 md:p-7"
    : "mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md sm:p-10";

  const formTitleClass = isClient
    ? "mb-6 text-lg font-bold text-[var(--ink)]"
    : "mb-8 text-2xl font-bold text-white";

  const infoBoxClass = isClient
    ? "border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3"
    : "rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3";

  const submitClass = isClient
    ? CTA_CLIENT
    : "w-full rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40 disabled:text-slate-950/60";

  const pricingStrip =
    pricing && (
      <div
        className={
          isClient
            ? "grid gap-3 sm:grid-cols-3"
            : "mx-auto grid max-w-4xl gap-4 sm:grid-cols-3"
        }
      >
        <FadeUp delay={0.1}>
          <div className={pricingCardClass}>
            <p className={pricingLabelClass}>Tariffa giornaliera</p>
            <p className={pricingValueClass}>
              {pricing.dailyRate.toFixed(2).replace(".", ",")}{" "}
              <span className={pricingUnitClass}>
                {pricing.currency}/borsa
              </span>
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className={pricingCardClass}>
            <p className={pricingLabelClass}>Capienza</p>
            <p className={pricingValueClass}>
              {pricing.capacity > 0 ? (
                <>
                  {pricing.capacity}{" "}
                  <span className={pricingUnitClass}>posti</span>
                </>
              ) : (
                <span className={pricingUnitClass}>su richiesta</span>
              )}
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className={pricingCardClass}>
            <p className={pricingLabelClass}>Orari</p>
            <p className={pricingValueClass}>
              {pricing.operatingHours ? (
                <>
                  {pricing.operatingHours.open}
                  <span className={pricingUnitClass}> - </span>
                  {pricing.operatingHours.close}
                </>
              ) : (
                <span className={pricingUnitClass}>in agenzia</span>
              )}
            </p>
          </div>
        </FadeUp>
      </div>
    );

  const pricingErrorBlock = pricingError && (
    <div
      className={
        isClient
          ? "border border-rose-500/30 bg-rose-500/10 p-4 text-center"
          : "mx-auto max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center"
      }
    >
      <p
        className={`text-sm ${isClient ? "text-rose-700" : "text-rose-300"}`}
        role="alert"
      >
        {pricingError}
      </p>
    </div>
  );

  const bookingForm = (
    <FadeUp delay={0.15}>
      <div className={formPanelClass}>
        <h2 className={formTitleClass}>Prenota il tuo deposito</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelWrap}>
              <span className={labelText}>Nome e cognome *</span>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
                aria-label="Nome e cognome"
                placeholder="Mario Rossi"
              />
            </label>

            <label className={labelWrap}>
              <span className={labelText}>Email *</span>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={inputClass}
                aria-label="Email"
                placeholder="mario@email.com"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelWrap}>
              <span className={labelText}>Telefono (opzionale)</span>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={inputClass}
                aria-label="Telefono"
                placeholder="+39 333 1234567"
              />
            </label>

            <label className={labelWrap}>
              <span className={labelText}>Numero borse *</span>
              <input
                type="number"
                required
                min={1}
                max={pricing?.maxBagsPerBooking ?? 10}
                value={bagCount}
                onChange={(e) => setBagCount(Number(e.target.value))}
                className={inputClass}
                aria-label="Numero borse"
              />
            </label>
          </div>

          <label className={labelWrap}>
            <span className={labelText}>Data deposito *</span>
            <input
              type="date"
              required
              min={today}
              max={maxDate}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className={inputClass}
              aria-label="Data deposito"
            />
          </label>

          {bookingDate && (
            <div className={infoBoxClass}>
              {availLoading ? (
                <p
                  className={`text-sm ${isClient ? "text-[var(--ink)]/50" : "text-slate-400"}`}
                >
                  Verifica disponibilita...
                </p>
              ) : availability ? (
                availability.available ? (
                  <p
                    className={`text-sm ${isClient ? "text-emerald-700" : "text-emerald-400"}`}
                  >
                    Disponibile &mdash; {availability.spotsLeft} posti rimanenti
                    su {availability.capacity}
                  </p>
                ) : (
                  <p
                    className={`text-sm ${isClient ? "text-rose-700" : "text-rose-400"}`}
                    role="alert"
                  >
                    Non disponibile per la data selezionata. Scegli
                    un&apos;altra data.
                  </p>
                )
              ) : (
                <p
                  className={`text-sm ${isClient ? "text-[var(--ink)]/45" : "text-slate-500"}`}
                >
                  Impossibile verificare la disponibilita.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelWrap}>
              <span className={labelText}>Check-in previsto (opzionale)</span>
              <input
                type="time"
                value={expectedCheckIn}
                onChange={(e) => setExpectedCheckIn(e.target.value)}
                className={inputClass}
                aria-label="Orario check-in previsto"
              />
            </label>

            <label className={labelWrap}>
              <span className={labelText}>Check-out previsto (opzionale)</span>
              <input
                type="time"
                value={expectedCheckOut}
                onChange={(e) => setExpectedCheckOut(e.target.value)}
                className={inputClass}
                aria-label="Orario check-out previsto"
              />
            </label>
          </div>

          <label className={labelWrap}>
            <span className={labelText}>Note (opzionale)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClass}
              aria-label="Note aggiuntive"
              placeholder="Informazioni aggiuntive..."
            />
          </label>

          {pricing && bagCount >= 1 && (
            <div className={infoBoxClass}>
              <p
                className={`text-sm ${isClient ? "text-[var(--ink)]/70" : "text-slate-300"}`}
              >
                Totale stimato:{" "}
                <span
                  className={`font-semibold ${isClient ? "text-[var(--ink)]" : "text-white"}`}
                >
                  {(pricing.dailyRate * bagCount)
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  {pricing.currency}
                </span>
                <span
                  className={isClient ? "text-[var(--ink)]/45" : "text-slate-500"}
                >
                  {" "}
                  ({bagCount} {bagCount === 1 ? "borsa" : "borse"} x{" "}
                  {pricing.dailyRate.toFixed(2).replace(".", ",")}{" "}
                  {pricing.currency})
                </span>
              </p>
            </div>
          )}

          <button type="submit" disabled={!canSubmit} className={submitClass}>
            {formState === "loading"
              ? "Prenotazione in corso..."
              : "Prenota deposito"}
          </button>

          {formError && (
            <p
              role="alert"
              className={`text-sm ${isClient ? "text-rose-700" : "text-rose-300"}`}
            >
              {formError}
            </p>
          )}
        </form>
      </div>
    </FadeUp>
  );

  if (isClient) {
    return (
      <div className="bg-[var(--paper)] text-[var(--ink)] px-5 pb-16 pt-8 md:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {pricingStrip}
          {pricingErrorBlock}
          {bookingForm}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <Container className="mb-20 text-center">
        <FadeUp>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Servizio deposito
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Deposito Bagagli
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="mt-4 text-2xl font-semibold sm:text-3xl">
            <span className="bg-gradient-to-r from-[#5E0ED7] via-cyan-400 to-[#22d3ee] bg-clip-text text-transparent">
              Viaggia leggero.
            </span>
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p className="mx-auto mt-6 max-w-xl text-base text-slate-400">
            Lascia i tuoi bagagli in sicurezza presso la nostra sede in Via
            Plinio il Vecchio 72, Castellammare di Stabia. Prenota online e
            goditi la giornata senza pensieri.
          </p>
        </FadeUp>
      </Container>

      {pricing && <Container className="mb-16">{pricingStrip}</Container>}

      {pricingError && (
        <Container className="mb-16">{pricingErrorBlock}</Container>
      )}

      <Container>{bookingForm}</Container>

      {/* ── Quick links ───────────────────────────────────────────── */}
      <Container className="mt-12 text-center">
        <FadeUp delay={0.1}>
          <Link
            href="/deposito-bagagli/i-miei-depositi"
            className="text-sm text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 transition hover:text-cyan-300"
          >
            Hai gia una prenotazione? Controlla i tuoi depositi
          </Link>
        </FadeUp>
      </Container>
    </main>
  );
}
