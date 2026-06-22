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
  operatingHours: { open: string; close: string };
  capacity: number;
};

type AvailabilityData = {
  date: string;
  available: boolean;
  spotsLeft: number;
  capacity: number;
};

type FormState = "idle" | "loading" | "success" | "error";

/* ─── Constants ────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

export default function DepositoBookingClient() {
  const router = useRouter();
  const reduced = useReducedMotion();

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
            setPricing(json.data ?? json);
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

      {/* ── Info Cards ────────────────────────────────────────────── */}
      {pricing && (
        <Container className="mb-16">
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
                <p className="text-sm font-medium text-slate-400">
                  Tariffa giornaliera
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {pricing.dailyRate.toFixed(2).replace(".", ",")}{" "}
                  <span className="text-lg text-slate-400">
                    {pricing.currency}/borsa
                  </span>
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
                <p className="text-sm font-medium text-slate-400">Capienza</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {pricing.capacity}{" "}
                  <span className="text-lg text-slate-400">posti</span>
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
                <p className="text-sm font-medium text-slate-400">Orari</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {pricing.operatingHours.open}
                  <span className="text-lg text-slate-400"> - </span>
                  {pricing.operatingHours.close}
                </p>
              </div>
            </FadeUp>
          </div>
        </Container>
      )}

      {pricingError && (
        <Container className="mb-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
            <p className="text-sm text-rose-300" role="alert">
              {pricingError}
            </p>
          </div>
        </Container>
      )}

      {/* ── Booking Form ──────────────────────────────────────────── */}
      <Container>
        <FadeUp delay={0.15}>
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md sm:p-10">
            <h2 className="mb-8 text-2xl font-bold text-white">
              Prenota il tuo deposito
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  Nome e cognome *
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={INPUT_CLASS}
                    aria-label="Nome e cognome"
                    placeholder="Mario Rossi"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-200">
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
              </div>

              {/* Telefono + Numero borse */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
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

                <label className="space-y-2 text-sm text-slate-200">
                  Numero borse *
                  <input
                    type="number"
                    required
                    min={1}
                    max={pricing?.maxBagsPerBooking ?? 10}
                    value={bagCount}
                    onChange={(e) => setBagCount(Number(e.target.value))}
                    className={INPUT_CLASS}
                    aria-label="Numero borse"
                  />
                </label>
              </div>

              {/* Data deposito */}
              <label className="block space-y-2 text-sm text-slate-200">
                Data deposito *
                <input
                  type="date"
                  required
                  min={today}
                  max={maxDate}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className={INPUT_CLASS}
                  aria-label="Data deposito"
                />
              </label>

              {/* Availability indicator */}
              {bookingDate && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  {availLoading ? (
                    <p className="text-sm text-slate-400">
                      Verifica disponibilita...
                    </p>
                  ) : availability ? (
                    availability.available ? (
                      <p className="text-sm text-emerald-400">
                        Disponibile &mdash; {availability.spotsLeft} posti
                        rimanenti su {availability.capacity}
                      </p>
                    ) : (
                      <p className="text-sm text-rose-400" role="alert">
                        Non disponibile per la data selezionata. Scegli
                        un&apos;altra data.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      Impossibile verificare la disponibilita.
                    </p>
                  )}
                </div>
              )}

              {/* Check-in / Check-out orari */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  Check-in previsto (opzionale)
                  <input
                    type="time"
                    value={expectedCheckIn}
                    onChange={(e) => setExpectedCheckIn(e.target.value)}
                    className={INPUT_CLASS}
                    aria-label="Orario check-in previsto"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-200">
                  Check-out previsto (opzionale)
                  <input
                    type="time"
                    value={expectedCheckOut}
                    onChange={(e) => setExpectedCheckOut(e.target.value)}
                    className={INPUT_CLASS}
                    aria-label="Orario check-out previsto"
                  />
                </label>
              </div>

              {/* Note */}
              <label className="block space-y-2 text-sm text-slate-200">
                Note (opzionale)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={INPUT_CLASS}
                  aria-label="Note aggiuntive"
                  placeholder="Informazioni aggiuntive..."
                />
              </label>

              {/* Riepilogo prezzo */}
              {pricing && bagCount >= 1 && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <p className="text-sm text-slate-300">
                    Totale stimato:{" "}
                    <span className="font-semibold text-white">
                      {(pricing.dailyRate * bagCount)
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      {pricing.currency}
                    </span>
                    <span className="text-slate-500">
                      {" "}
                      ({bagCount} {bagCount === 1 ? "borsa" : "borse"} x{" "}
                      {pricing.dailyRate.toFixed(2).replace(".", ",")}{" "}
                      {pricing.currency})
                    </span>
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-full bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40 disabled:text-slate-950/60"
              >
                {formState === "loading"
                  ? "Prenotazione in corso..."
                  : "Prenota deposito"}
              </button>

              {/* Error message */}
              {formError && (
                <p role="alert" className="text-sm text-rose-300">
                  {formError}
                </p>
              )}
            </form>
          </div>
        </FadeUp>
      </Container>

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
