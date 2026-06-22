"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

type AvailabilityData = {
  date: string;
  available: boolean;
  spotsLeft: number;
  capacity: number;
};

/* ─── Constants ────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=Via%20Plinio%20il%20Vecchio%2072%2C%2080053%20Castellammare%20di%20Stabia%20(NA)&output=embed";

/* ─── Helpers ──────────────────────────────────────────────────────── */

/** Format a YYYY-MM-DD string to "22 giu" style */
function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

/** Calculate the number of days between two YYYY-MM-DD strings (minimum 1) */
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

/** Format price with Italian comma */
function fmtPrice(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/* ─── Animation wrapper ───────────────────────────────────────────── */

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

export default function RisultatiClient() {
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

  /* ── API state ──────────────────────────────────────────────────── */

  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── Fetch pricing + availability on mount ─────────────────────── */

  const fetchData = useCallback(async () => {
    if (hasMissingParams) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const [pricingRes, availRes] = await Promise.all([
        fetch("/api/deposito-bagagli/pricing"),
        fetch(
          `/api/deposito-bagagli/availability?date=${encodeURIComponent(checkin)}`,
        ),
      ]);

      const pricingJson = await pricingRes.json();
      const availJson = await availRes.json();

      if (pricingJson.success === false) {
        setError(
          pricingJson.error?.message ?? "Impossibile caricare i prezzi.",
        );
      } else {
        const p = pricingJson.data ?? pricingJson.pricing ?? pricingJson;
        setPricing({
          dailyRate: p.dailyRate ?? p.daily_rate ?? 1.95,
          currency: p.currency ?? "EUR",
          maxBagsPerBooking: p.maxBagsPerBooking ?? 10,
          maxDaysAdvance: p.maxDaysAdvance ?? 30,
          operatingHours: p.operatingHours ?? p.operating_hours ?? null,
          capacity: p.capacity ?? 50,
        });
      }

      if (availJson.success !== false) {
        const av = availJson.data ?? availJson.availability ?? availJson;
        setAvailability({
          date: av.date ?? checkin,
          available: av.available ?? (av.availableBags > 0),
          spotsLeft: av.spotsLeft ?? av.availableBags ?? 0,
          capacity: av.capacity ?? 50,
        });
      }
    } catch {
      setError("Servizio momentaneamente non disponibile.");
    } finally {
      setLoading(false);
    }
  }, [checkin, hasMissingParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Derived values ─────────────────────────────────────────────── */

  const days = calcDays(checkin, checkout);
  const totalPrice = pricing ? pricing.dailyRate * totalBags * days : 0;
  const isAvailable = availability?.available ?? false;

  /* ── Build "Seleziona" link with all params ─────────────────────── */

  const prenotaParams = new URLSearchParams();
  if (checkin) prenotaParams.set("checkin", checkin);
  if (checkinTime) prenotaParams.set("checkinTime", checkinTime);
  if (checkout) prenotaParams.set("checkout", checkout);
  if (checkoutTime) prenotaParams.set("checkoutTime", checkoutTime);
  prenotaParams.set("bags", String(totalBags));
  if (small) prenotaParams.set("small", String(small));
  if (medium) prenotaParams.set("medium", String(medium));
  if (large) prenotaParams.set("large", String(large));
  if (backpacks) prenotaParams.set("backpacks", String(backpacks));
  const prenotaHref = `/deposito-bagagli/prenota?${prenotaParams.toString()}`;

  /* ── Search summary label ───────────────────────────────────────── */

  const summaryParts: string[] = ["Castellammare di Stabia"];
  if (checkin) {
    let dateStr = formatShortDate(checkin);
    if (checkinTime) dateStr += ` ${checkinTime}`;
    dateStr += " - ";
    dateStr += formatShortDate(checkout);
    if (checkoutTime) dateStr += ` ${checkoutTime}`;
    summaryParts.push(dateStr);
  }
  summaryParts.push(
    `${totalBags} ${totalBags === 1 ? "bagaglio" : "bagagli"}`,
  );
  const summaryLabel = summaryParts.join(" · ");

  /* ── Missing params state ───────────────────────────────────────── */

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
              Parametri di ricerca mancanti
            </h1>
            <p className="mt-4 text-base text-slate-400">
              Non abbiamo trovato i parametri della tua ricerca. Torna alla
              pagina principale per iniziare una nuova ricerca.
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

  /* ── Main render ────────────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      {/* ── Search summary bar ─────────────────────────────────────── */}
      <Container className="mb-8">
        <FadeUp>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z"
                />
              </svg>
              <p className="text-sm font-medium text-white">{summaryLabel}</p>
            </div>
            <Link
              href="/deposito-bagagli"
              className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
            >
              Modifica ricerca
            </Link>
          </div>
        </FadeUp>
      </Container>

      {/* ── Content area ───────────────────────────────────────────── */}
      <Container>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ── Left: result card (60%) ─────────────────────────────── */}
          <div className="lg:col-span-3">
            <FadeUp delay={0.1}>
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <p className="text-sm text-slate-400">
                    Verifica disponibilita...
                  </p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
                  <p className="text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchData()}
                    className="mt-4 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Riprova
                  </button>
                </div>
              ) : (
                /* ── Deposit card ───────────────────────────────────── */
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                  {/* Header strip */}
                  <div className="h-1 w-full bg-linear-to-r from-[#5E0ED7] to-[#22d3ee]" />

                  <div className="p-6 sm:p-8">
                    {/* Title + availability badge */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          AG SERVIZI - Deposito Bagagli
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          Via Plinio il Vecchio 72, 80053 Castellammare di
                          Stabia (NA)
                        </p>
                      </div>

                      {availability && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isAvailable
                              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isAvailable ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {isAvailable ? "Disponibile" : "Completo"}
                        </span>
                      )}
                    </div>

                    {/* Info row */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {/* Distance */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5E0ED7]/15">
                          <svg
                            className="h-4 w-4 text-[#5E0ED7]"
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
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Sede</p>
                          <p className="text-sm font-medium text-white">
                            Deposito in sede
                          </p>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15">
                          <svg
                            className="h-4 w-4 text-cyan-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Orari</p>
                          <p className="text-sm font-medium text-white">
                            {pricing?.operatingHours
                              ? `${pricing.operatingHours.open} - ${pricing.operatingHours.close}`
                              : "08:45 - 19:00"}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                          <svg
                            className="h-4 w-4 text-amber-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Valutazione</p>
                          <p className="text-sm font-medium text-white">
                            5.0 &#9733; (10 recensioni)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-6 h-px bg-white/10" />

                    {/* Price + CTA */}
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        {pricing && (
                          <>
                            <p className="text-2xl font-bold text-white">
                              {fmtPrice(pricing.dailyRate)} {pricing.currency}
                              <span className="text-sm font-normal text-slate-400">
                                /borsa/giorno
                              </span>
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Totale stimato:{" "}
                              <span className="font-semibold text-white">
                                {fmtPrice(totalPrice)} {pricing.currency}
                              </span>
                              <span className="text-slate-500">
                                {" "}
                                ({totalBags}{" "}
                                {totalBags === 1 ? "borsa" : "borse"} x{" "}
                                {days} {days === 1 ? "giorno" : "giorni"})
                              </span>
                            </p>
                          </>
                        )}

                        {availability && isAvailable && (
                          <p className="mt-2 text-xs text-emerald-400">
                            {availability.spotsLeft} posti rimanenti su{" "}
                            {availability.capacity}
                          </p>
                        )}
                      </div>

                      {isAvailable ? (
                        <Link
                          href={prenotaHref}
                          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                        >
                          Seleziona
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed">
                          Non disponibile
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </FadeUp>
          </div>

          {/* ── Right: map (40%) ────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <FadeUp delay={0.2}>
              <div className="sticky top-28 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                {/* Map iframe */}
                <div className="aspect-[4/3] w-full">
                  <iframe
                    title="Mappa AG SERVIZI - Deposito Bagagli"
                    src={MAPS_EMBED_SRC}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                {/* Address card below map */}
                <div className="p-5">
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
                      <p className="text-sm font-semibold text-white">
                        AG SERVIZI
                      </p>
                      <p className="mt-0.5 text-sm text-slate-400">
                        Via Plinio il Vecchio 72, 80053
                        <br />
                        Castellammare di Stabia (NA)
                      </p>
                    </div>
                  </div>

                  {pricing && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                      <svg
                        className="h-4 w-4 shrink-0 text-cyan-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z"
                        />
                      </svg>
                      <span>
                        Orari: {pricing.operatingHours?.open ?? "08:45"} -{" "}
                        {pricing.operatingHours?.close ?? "19:00"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </Container>
    </main>
  );
}
