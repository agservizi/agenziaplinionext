"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ──────────────────────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────────────────────── */

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 18; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────── */

interface BagCounts {
  small: number;
  medium: number;
  large: number;
  backpacks: number;
}

interface AvailabilityData {
  available: boolean;
  spotsLeft?: number;
}

/* ──────────────────────────────────────────────────────────────
   Utility: format date like "22 giu"
   ────────────────────────────────────────────────────────────── */

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "gen", "feb", "mar", "apr", "mag", "giu",
    "lug", "ago", "set", "ott", "nov", "dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────────
   Icons (inline SVGs)
   ────────────────────────────────────────────────────────────── */

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function SuitcaseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="16" height="14" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M12 12v4" />
    </svg>
  );
}

function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
      <circle cx="19" cy="8" r="3" />
      <path d="M22 21v-1.5a3 3 0 00-2.5-2.96" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Counter / Stepper
   ────────────────────────────────────────────────────────────── */

function BagCounter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-white/80">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          aria-label={`Rimuovi ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10" /></svg>
        </button>
        <span className="w-6 text-center text-sm font-semibold text-white" aria-live="polite">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Aggiungi ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-white/40 hover:text-white"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M8 3v10" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────── */

export default function LuggageBookingWidget() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  /* ── State ── */
  const [checkinDate, setCheckinDate] = useState("");
  const [checkinTime, setCheckinTime] = useState("10:00");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("18:00");
  const [bags, setBags] = useState<BagCounts>({ small: 0, medium: 0, large: 0, backpacks: 0 });
  const [dailyRate, setDailyRate] = useState<string>("1,95");

  /* Popovers */
  const [dateOpen, setDateOpen] = useState(false);
  const [bagsOpen, setBagsOpen] = useState(false);

  /* Availability */
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  /* Refs for click-outside */
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const bagsPopoverRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const bagsButtonRef = useRef<HTMLButtonElement>(null);

  /* ── Fetch pricing on mount ── */
  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch("/api/deposito-bagagli/pricing");
        const data = await res.json();
        if (data?.success !== false && data?.pricing?.dailyRate) {
          const rate = Number(data.pricing.dailyRate);
          setDailyRate(rate.toFixed(2).replace(".", ","));
        } else if (data?.dailyRate) {
          const rate = Number(data.dailyRate);
          setDailyRate(rate.toFixed(2).replace(".", ","));
        }
      } catch {
        /* keep default */
      }
    }
    fetchPricing();
  }, []);

  /* ── Fetch availability when check-in date changes ── */
  useEffect(() => {
    if (!checkinDate) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    async function fetchAvailability() {
      try {
        const res = await fetch(`/api/deposito-bagagli/availability?date=${checkinDate}`);
        const data = await res.json();
        if (!cancelled) {
          if (data?.success !== false) {
            setAvailability({
              available: data.available ?? data.availability?.available ?? true,
              spotsLeft: data.spotsLeft ?? data.availability?.spotsLeft,
            });
          } else {
            setAvailability(null);
          }
        }
      } catch {
        if (!cancelled) setAvailability(null);
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    }
    fetchAvailability();
    return () => { cancelled = true; };
  }, [checkinDate]);

  /* ── Close popovers on Escape or click-outside ── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (dateOpen) {
          setDateOpen(false);
          dateButtonRef.current?.focus();
        }
        if (bagsOpen) {
          setBagsOpen(false);
          bagsButtonRef.current?.focus();
        }
      }
    }
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dateOpen && datePopoverRef.current && !datePopoverRef.current.contains(target) && !dateButtonRef.current?.contains(target)) {
        setDateOpen(false);
      }
      if (bagsOpen && bagsPopoverRef.current && !bagsPopoverRef.current.contains(target) && !bagsButtonRef.current?.contains(target)) {
        setBagsOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [dateOpen, bagsOpen]);

  /* ── Computed ── */
  const totalBags = bags.small + bags.medium + bags.large + bags.backpacks;
  const hasBags = totalBags > 0;
  const hasDates = checkinDate !== "" && checkoutDate !== "";
  const isValid = hasDates && hasBags;

  const dateSummary = hasDates
    ? `${formatShortDate(checkinDate)}, ${checkinTime} — ${formatShortDate(checkoutDate)}, ${checkoutTime}`
    : "Seleziona date e orari";

  const bagsSummary = hasBags
    ? `${totalBags} bagagl${totalBags === 1 ? "io" : "i"}`
    : "Aggiungi borse";

  /* ── Validate dates ── */
  const today = todayStr();

  const handleCheckinDateChange = useCallback((val: string) => {
    setCheckinDate(val);
    // auto-set checkout to same day if not set or if checkout is before new checkin
    if (!checkoutDate || val > checkoutDate) {
      setCheckoutDate(val);
    }
  }, [checkoutDate]);

  /* ── Submit ── */
  const handleSubmit = useCallback(() => {
    if (!isValid) return;
    const params = new URLSearchParams({
      checkin: checkinDate,
      checkinTime,
      checkout: checkoutDate,
      checkoutTime,
      bags: String(totalBags),
      small: String(bags.small),
      medium: String(bags.medium),
      large: String(bags.large),
      backpacks: String(bags.backpacks),
    });
    router.push(`/deposito-bagagli/risultati?${params.toString()}`);
  }, [isValid, checkinDate, checkinTime, checkoutDate, checkoutTime, totalBags, bags, router]);

  /* ── Trust stats ── */
  const trustItems = [
    { icon: <ShieldIcon />, text: "Assicurazione inclusa" },
    { icon: <CheckCircleIcon />, text: "Cancellazione gratuita" },
    { icon: <ClockIcon />, text: "Deposito sicuro 24/7" },
    { icon: <UsersIcon />, text: "Oltre 500 clienti" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ fontFamily: "var(--font-inter, 'Inter'), sans-serif" }}
    >
      {/* ── Background gradient ── */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0a1628] via-[#0f2847] to-[#0c3155]" />

      {/* ── Film grain texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }}
        aria-hidden="true"
      />

      {/* ── Floating orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={reduced ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
          transition={reduced ? undefined : { repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full opacity-20 blur-[120px] md:h-[500px] md:w-[500px]"
          style={{ background: "radial-gradient(circle, #5E0ED7, transparent 70%)" }}
        />
        <motion.div
          animate={reduced ? undefined : { x: [0, -20, 0], y: [0, 25, 0] }}
          transition={reduced ? undefined : { repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute -right-24 bottom-1/4 h-[280px] w-[280px] rounded-full opacity-15 blur-[100px] md:h-[400px] md:w-[400px]"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-4 py-20 sm:px-6 md:py-28 lg:py-32">
        <div className="mx-auto max-w-5xl">
          {/* ── Hero text ── */}
          <div className="mb-10 text-center md:mb-14">
            <FadeUp>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60 backdrop-blur-sm">
                <SuitcaseIcon className="h-3.5 w-3.5" />
                Deposito Bagagli
              </span>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h2
                className="mt-5 font-black text-white"
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                Deposito bagagli sicuro
              </h2>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p
                className="mt-2 inline-block bg-clip-text font-bold text-transparent"
                style={{
                  fontSize: "clamp(1.4rem, 4vw, 2.5rem)",
                  lineHeight: 1.1,
                  backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee)",
                }}
              >
                a Castellammare di Stabia
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="mt-4 text-sm text-white/50 sm:text-base">
                Liberta di esplorare a partire da{" "}
                <span className="font-semibold text-white/80">&euro;{dailyRate}/giorno</span>
              </p>
            </FadeUp>
          </div>

          {/* ── Search card ── */}
          <FadeUp delay={0.35}>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                {/* ── Field 1: Location ── */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <SearchIcon className="h-5 w-5 shrink-0 text-white/40" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Luogo</p>
                    <p className="truncate text-sm font-medium text-white/80" title="AG SERVIZI - Via Plinio il Vecchio 72, Castellammare di Stabia">
                      AG SERVIZI - Via Plinio il Vecchio 72
                    </p>
                  </div>
                  <LockIcon className="h-4 w-4 shrink-0 text-white/25" />
                  {/* Hidden input for screen readers */}
                  <input
                    type="hidden"
                    name="location"
                    value="AG SERVIZI - Via Plinio il Vecchio 72, Castellammare di Stabia"
                    aria-label="Luogo di deposito"
                    readOnly
                  />
                </div>

                {/* ── Field 2: Date/Time ── */}
                <div className="relative">
                  <button
                    ref={dateButtonRef}
                    type="button"
                    onClick={() => { setDateOpen(!dateOpen); setBagsOpen(false); }}
                    aria-expanded={dateOpen}
                    aria-haspopup="dialog"
                    aria-label="Seleziona date e orari di check-in e check-out"
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/8"
                  >
                    <CalendarIcon className="h-5 w-5 shrink-0 text-white/40" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Date e orari</p>
                      <p className={`truncate text-sm font-medium ${hasDates ? "text-white/80" : "text-white/40"}`}>
                        {dateSummary}
                      </p>
                    </div>
                    {/* Availability indicator */}
                    {checkinDate && !loadingAvailability && availability && (
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${availability.available ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"}`}
                        title={availability.available ? "Disponibile" : "Non disponibile"}
                      />
                    )}
                    {loadingAvailability && (
                      <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-white/30" />
                    )}
                    <svg className={`h-4 w-4 shrink-0 text-white/30 transition-transform ${dateOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Date/Time Popover */}
                  {dateOpen && (
                    <div
                      ref={datePopoverRef}
                      role="dialog"
                      aria-label="Seleziona date e orari"
                      className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/15 bg-[#0f1d32]/95 p-4 shadow-2xl backdrop-blur-xl sm:min-w-[340px] md:left-auto md:right-auto md:w-[360px]"
                    >
                      <div className="space-y-4">
                        {/* Check-in */}
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Check-in</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="luggage-checkin-date" className="mb-1 block text-[10px] text-white/40">Data</label>
                              <input
                                id="luggage-checkin-date"
                                type="date"
                                value={checkinDate}
                                min={today}
                                onChange={(e) => handleCheckinDateChange(e.target.value)}
                                aria-label="Data di check-in"
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30 [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <label htmlFor="luggage-checkin-time" className="mb-1 block text-[10px] text-white/40">Orario</label>
                              <select
                                id="luggage-checkin-time"
                                value={checkinTime}
                                onChange={(e) => setCheckinTime(e.target.value)}
                                aria-label="Orario di check-in"
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30 [color-scheme:dark]"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={`ci-${t}`} value={t} className="bg-[#0f1d32] text-white">{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Check-out */}
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Check-out</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="luggage-checkout-date" className="mb-1 block text-[10px] text-white/40">Data</label>
                              <input
                                id="luggage-checkout-date"
                                type="date"
                                value={checkoutDate}
                                min={checkinDate || today}
                                onChange={(e) => setCheckoutDate(e.target.value)}
                                aria-label="Data di check-out"
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30 [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <label htmlFor="luggage-checkout-time" className="mb-1 block text-[10px] text-white/40">Orario</label>
                              <select
                                id="luggage-checkout-time"
                                value={checkoutTime}
                                onChange={(e) => setCheckoutTime(e.target.value)}
                                aria-label="Orario di check-out"
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30 [color-scheme:dark]"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={`co-${t}`} value={t} className="bg-[#0f1d32] text-white">{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Availability notice */}
                        {checkinDate && availability && (
                          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${availability.available ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                            <span className={`h-2 w-2 rounded-full ${availability.available ? "bg-emerald-400" : "bg-red-400"}`} />
                            {availability.available
                              ? `Disponibile${availability.spotsLeft ? ` (${availability.spotsLeft} posti)` : ""}`
                              : "Non disponibile per questa data"}
                          </div>
                        )}

                        {/* Confirm button */}
                        <button
                          type="button"
                          onClick={() => { setDateOpen(false); dateButtonRef.current?.focus(); }}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                          Conferma
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Field 3: Bags ── */}
                <div className="relative">
                  <button
                    ref={bagsButtonRef}
                    type="button"
                    onClick={() => { setBagsOpen(!bagsOpen); setDateOpen(false); }}
                    aria-expanded={bagsOpen}
                    aria-haspopup="dialog"
                    aria-label="Seleziona numero e tipo di bagagli"
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/8"
                  >
                    <SuitcaseIcon className="h-5 w-5 shrink-0 text-white/40" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Bagagli</p>
                      <p className={`text-sm font-medium ${hasBags ? "text-white/80" : "text-white/40"}`}>
                        {bagsSummary}
                      </p>
                    </div>
                    <svg className={`h-4 w-4 shrink-0 text-white/30 transition-transform ${bagsOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Bags Popover */}
                  {bagsOpen && (
                    <div
                      ref={bagsPopoverRef}
                      role="dialog"
                      aria-label="Seleziona il numero di bagagli"
                      className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/15 bg-[#0f1d32]/95 p-4 shadow-2xl backdrop-blur-xl sm:min-w-[280px] md:left-auto md:right-0 md:w-[300px]"
                    >
                      <div className="space-y-1">
                        <BagCounter
                          label="Valigie piccole"
                          value={bags.small}
                          onChange={(v) => setBags((prev) => ({ ...prev, small: v }))}
                        />
                        <BagCounter
                          label="Valigie medie"
                          value={bags.medium}
                          onChange={(v) => setBags((prev) => ({ ...prev, medium: v }))}
                        />
                        <BagCounter
                          label="Valigie grandi"
                          value={bags.large}
                          onChange={(v) => setBags((prev) => ({ ...prev, large: v }))}
                        />
                        <BagCounter
                          label="Zaini"
                          value={bags.backpacks}
                          onChange={(v) => setBags((prev) => ({ ...prev, backpacks: v }))}
                        />
                      </div>

                      {hasBags && (
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-white/60">Totale</span>
                            <span className="font-bold text-white">{totalBags} bagagl{totalBags === 1 ? "io" : "i"}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => { setBagsOpen(false); bagsButtonRef.current?.focus(); }}
                        className="mt-3 w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        Conferma
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Field 4: CTA ── */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid}
                  aria-label="Cerca deposito bagagli"
                  className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-300 md:col-span-2 lg:col-span-1 ${
                    isValid
                      ? "bg-linear-to-r from-[#0066FF] to-[#0099FF] shadow-lg shadow-blue-500/25 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35"
                      : "cursor-not-allowed bg-white/10 text-white/30"
                  }`}
                >
                  <SearchIcon className="h-4 w-4" />
                  Trova depositi
                </button>
              </div>
            </div>
          </FadeUp>

          {/* ── Trust stats bar ── */}
          <FadeUp delay={0.5}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
              {trustItems.map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-white/40">
                  {item.icon}
                  <span className="text-xs font-medium sm:text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
