"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BOOKING_SERVICE_OPTIONS, resolveClientBookingApiBase } from "@/lib/booking-api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BookingHealthResponse = {
  ok?: boolean;
  checks?: Record<string, boolean>;
  message?: string;
};

type BookingSlot = {
  start: string;
  end: string;
};

type BookingAvailabilityResponse = {
  slots?: BookingSlot[];
  message?: string;
};

type BookingCreateResponse = {
  message?: string;
  start?: string;
  end?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers (unchanged)                                                */
/* ------------------------------------------------------------------ */

function isSundayDate(value: string) {
  if (!value) return false;
  const date = new Date(`${value}T12:00:00`);
  return date.getDay() === 0;
}

function getNextBookableDateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  while (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getLocalDateInputValue(offsetDays = 0) {
  return getNextBookableDateValue(offsetDays);
}

function formatSlotLabel(isoValue: string) {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoValue));
  } catch {
    return isoValue;
  }
}

function formatAppointmentDate(isoValue?: string) {
  if (!isoValue) return "";

  try {
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoValue));
  } catch {
    return isoValue;
  }
}

/* ------------------------------------------------------------------ */
/*  Custom Calendar Picker                                             */
/* ------------------------------------------------------------------ */

const DAY_NAMES = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function CalendarPicker({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  minDate: string;
}) {
  const selected = value ? new Date(`${value}T12:00:00`) : null;
  const min = new Date(`${minDate}T00:00:00`);

  const [viewYear, setViewYear] = useState(() => (selected ?? min).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selected ?? min).getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const monthLabel = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(
    new Date(viewYear, viewMonth, 1),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isPrevDisabled =
    viewYear < min.getFullYear() ||
    (viewYear === min.getFullYear() && viewMonth <= min.getMonth());

  return (
    <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="flex h-8 w-8 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Mese precedente"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          aria-label="Mese successivo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5 sm:gap-1">
        {DAY_NAMES.map((d) => (
          <span
            key={d}
            className={`text-center text-[9px] font-bold uppercase tracking-[0.12em] sm:text-[10px] ${
              d === "Dom" ? "text-[#5E0ED7]/55" : "text-[var(--ink)]/40"
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const cellDate = new Date(viewYear, viewMonth, day);
          cellDate.setHours(0, 0, 0, 0);
          const isSunday = cellDate.getDay() === 0;
          const isPast = cellDate < min;
          const disabled = isSunday || isPast;
          const isToday =
            cellDate.getFullYear() === today.getFullYear() &&
            cellDate.getMonth() === today.getMonth() &&
            cellDate.getDate() === today.getDate();
          const isSelected =
            selected &&
            cellDate.getFullYear() === selected.getFullYear() &&
            cellDate.getMonth() === selected.getMonth() &&
            cellDate.getDate() === selected.getDate();

          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`flex h-8 w-full items-center justify-center text-xs font-semibold transition sm:h-9 sm:text-sm ${
                isSelected
                  ? "bg-[var(--ink)] text-white"
                  : isToday
                    ? "border border-[#5E0ED7] text-[#5E0ED7]"
                    : disabled
                      ? "cursor-not-allowed text-[var(--ink)]/25"
                      : "text-[var(--ink)] hover:bg-[var(--ink)]/5"
              }`}
              aria-label={`${day} ${monthLabel}`}
              aria-pressed={!!isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icons mapped by service value                           */
/* ------------------------------------------------------------------ */

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Consulenza telefonia": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  "Consulenza energia": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  "Servizi digitali": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  "Spedizioni assistite": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  ),
  "Pratiche CAF e Patronato": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1={16} y1={13} x2={8} y2={13} />
      <line x1={16} y1={17} x2={8} y2={17} />
      <line x1={10} y1={9} x2={8} y2={9} />
    </svg>
  ),
  "Web Agency": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <circle cx={12} cy={12} r={10} />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Reduced-motion hook                                                */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/*  Step progress indicator                                            */
/* ------------------------------------------------------------------ */

const STEP_LABELS = ["Servizio", "Orario", "Dati"] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-0 border-y border-[var(--ink)]/10 px-4 py-4">
      {STEP_LABELS.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} className="flex items-center">
            {index > 0 && (
              <div className="mx-1 h-px w-8 sm:w-12 md:w-16">
                <div
                  className={`h-full transition-colors duration-300 ${
                    isCompleted || isActive ? "bg-[#5E0ED7]" : "bg-[var(--ink)]/15"
                  }`}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-[var(--ink)] text-white"
                    : isActive
                      ? "border-2 border-[#5E0ED7] text-[#5E0ED7]"
                      : "border border-[var(--ink)]/15 text-[var(--ink)]/35"
                }`}
              >
                {isCompleted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? "text-[#5E0ED7]" : isCompleted ? "text-[var(--ink)]/55" : "text-[var(--ink)]/30"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated checkmark (success screen)                                */
/* ------------------------------------------------------------------ */

function AnimatedCheckmark() {
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 52 52" className="h-24 w-24">
        <circle
          cx={26}
          cy={26}
          r={24}
          fill="none"
          stroke="#5E0ED7"
          strokeWidth={2}
          style={{
            strokeDasharray: 151,
            strokeDashoffset: 151,
            animation: "drawCircle 0.6s ease-in-out forwards",
          }}
        />
        <path
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
          fill="none"
          stroke="#5E0ED7"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 36,
            strokeDashoffset: 36,
            animation: "drawCheck 0.4s ease-in-out 0.4s forwards",
          }}
        />
      </svg>
      <style>{`
        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PublicBookingDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  /* --- All original state variables (unchanged) --- */
  const [healthStatus, setHealthStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [healthMessage, setHealthMessage] = useState("");
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [date, setDate] = useState(getLocalDateInputValue());
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [slotStatus, setSlotStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [slotMessage, setSlotMessage] = useState("");
  const [service, setService] = useState(BOOKING_SERVICE_OPTIONS[0]?.value || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const [confirmedStart, setConfirmedStart] = useState("");

  /* --- Wizard state --- */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [mounted, setMounted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  /* --- Reset step on close --- */
  useEffect(() => {
    if (!open) {
      setStep(1);
      setDirection(1);
    }
  }, [open]);

  /* --- Focus management: auto-focus name field on step 3 --- */
  useEffect(() => {
    if (step === 3) {
      // Small delay to let animation start before focusing
      const timer = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  /* --- All original useEffect hooks for API calls (unchanged) --- */

  useEffect(() => {
    if (open && isSundayDate(date)) {
      setDate(getNextBookableDateValue());
    }
  }, [date, open]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    setHealthStatus("loading");
    setHealthMessage("");

    const bookingApiBase = resolveClientBookingApiBase();
    if (!bookingApiBase) {
      setBookingEnabled(false);
      setHealthStatus("error");
      setHealthMessage("Il collegamento al calendario non è configurato.");
      return () => {
        active = false;
      };
    }

    fetch(`${bookingApiBase}/api/booking/health`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as BookingHealthResponse | null;
        if (!active) return;

        if (!response.ok) {
          setBookingEnabled(false);
          setHealthStatus("error");
          setHealthMessage(payload?.message || "Prenotazioni non disponibili al momento.");
          return;
        }

        if (!payload?.ok) {
          setBookingEnabled(false);
          setHealthStatus("error");
          setHealthMessage("Il calendario non è ancora pronto per ricevere prenotazioni online.");
          return;
        }

        setBookingEnabled(true);
        setHealthStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setBookingEnabled(false);
        setHealthStatus("error");
        setHealthMessage("Non riesco a collegarmi al calendario in questo momento.");
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !bookingEnabled || !date) return;

    if (isSundayDate(date)) {
      setSlots([]);
      setSelectedTime("");
      setSlotStatus("error");
      setSlotMessage("La domenica l'agenzia è chiusa: scegli un altro giorno.");
      return;
    }

    let active = true;
    setSlotStatus("loading");
    setSlotMessage("");
    setSelectedTime("");

    const bookingApiBase = resolveClientBookingApiBase();
    if (!bookingApiBase) {
      setSlots([]);
      setSlotStatus("error");
      setSlotMessage("Il collegamento al calendario non è configurato.");
      return () => {
        active = false;
      };
    }

    fetch(`${bookingApiBase}/api/booking/availability?date=${encodeURIComponent(date)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as BookingAvailabilityResponse | null;
        if (!active) return;

        if (!response.ok) {
          setSlots([]);
          setSlotStatus("error");
          setSlotMessage(payload?.message || "Non riesco a leggere gli orari disponibili.");
          return;
        }

        const nextSlots = Array.isArray(payload?.slots) ? payload.slots : [];
        setSlots(nextSlots);
        setSlotStatus("ready");
        setSlotMessage(
          nextSlots.length === 0
            ? "Per questa data non ci sono slot liberi. Prova a cambiare giorno."
            : "",
        );
      })
      .catch(() => {
        if (!active) return;
        setSlots([]);
        setSlotStatus("error");
        setSlotMessage("Non riesco a recuperare gli slot in questo momento.");
      });

    return () => {
      active = false;
    };
  }, [bookingEnabled, date, open]);

  useEffect(() => {
    if (!open) {
      setSubmitStatus("idle");
      setSubmitMessage("");
      setConfirmedStart("");
    }
  }, [open]);

  /* --- Original submit handler (unchanged) --- */

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTime) {
      setSubmitStatus("error");
      setSubmitMessage("Seleziona uno slot disponibile prima di confermare.");
      return;
    }

    setSubmitStatus("loading");
    setSubmitMessage("");
    setConfirmedStart("");

    const bookingApiBase = resolveClientBookingApiBase();
    if (!bookingApiBase) {
      setSubmitStatus("error");
      setSubmitMessage("Il collegamento al calendario non è configurato.");
      return;
    }

    try {
      const response = await fetch(`${bookingApiBase}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          date,
          time: selectedTime,
          name,
          email,
          phone,
          notes,
        }),
      });

      const payload = (await response.json().catch(() => null)) as BookingCreateResponse | null;

      if (!response.ok) {
        setSubmitStatus("error");
        setSubmitMessage(payload?.message || "Non sono riuscito a confermare l'appuntamento.");
        return;
      }

      setSubmitStatus("success");
      setSubmitMessage(payload?.message || "Appuntamento confermato.");
      setConfirmedStart(payload?.start || "");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setSelectedTime("");
    } catch {
      setSubmitStatus("error");
      setSubmitMessage("Non riesco a salvare la prenotazione in questo momento.");
    }
  };

  /* --- Navigation helpers --- */

  const goForward = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  /* --- Animation variants --- */

  const slideVariants = reducedMotion
    ? { enter: {}, center: {}, exit: {} }
    : {
        enter: (d: number) => ({
          x: d > 0 ? 280 : -280,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (d: number) => ({
          x: d > 0 ? -280 : 280,
          opacity: 0,
        }),
      };

  const slideTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 35 };

  /* --- Derived --- */

  const selectedServiceMeta = BOOKING_SERVICE_OPTIONS.find((item) => item.value === service);
  const canContinueStep2 = !!selectedTime;

  /* --- Render --- */

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="booking-overlay"
            className="fixed inset-0 z-[100] bg-[var(--ink)]/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="booking-drawer"
            className="fixed right-0 top-0 z-[110] flex h-svh w-full max-w-xl flex-col overflow-hidden border-l border-[var(--ink)]/12 bg-[var(--paper)] text-[var(--ink)] shadow-[-24px_0_60px_rgba(11,17,32,0.12)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            aria-modal="true"
            aria-label="Prenota appuntamento"
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--ink)]/10 px-5 py-4 md:px-6 md:py-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
                    Prenotazione rapida
                  </p>
                  <h2 className="display-type text-2xl text-[var(--ink)] md:text-3xl">
                    Prenota<span className="text-[#5E0ED7]">.</span>
                  </h2>
                  <p className="max-w-xs text-xs leading-relaxed text-[var(--ink)]/60 md:text-sm">
                    Scegli servizio, data e orario. Ti confermiamo sullo slot libero.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                  aria-label="Chiudi"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1={18} y1={6} x2={6} y2={18} />
                    <line x1={6} y1={6} x2={18} y2={18} />
                  </svg>
                </button>
              </div>

              {healthStatus === "loading" && (
                <div className="mx-6 mt-6 border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-5 text-sm text-[var(--ink)]/70 md:mx-8">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin text-[#5E0ED7]" viewBox="0 0 24 24" fill="none">
                      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} className="opacity-20" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                    </svg>
                    Sto controllando il calendario disponibile...
                  </div>
                </div>
              )}

              {healthStatus === "error" && (
                <div className="mx-6 mt-6 border border-red-700/25 bg-red-50 p-5 text-sm text-red-900 md:mx-8">
                  {healthMessage}
                </div>
              )}

              {submitStatus === "success" ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center md:px-8">
                  <AnimatedCheckmark />
                  <div className="space-y-2">
                    <h3 className="display-type text-3xl text-[var(--ink)]">Confermato.</h3>
                    <p className="text-sm text-[var(--ink)]/65">{submitMessage}</p>
                    {confirmedStart && (
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#5E0ED7]">
                        {formatAppointmentDate(confirmedStart)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="brutal-cta-ink mt-4 inline-flex min-h-[44px] items-center justify-center bg-[var(--ink)] px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
                  >
                    Chiudi
                  </button>
                </div>
              ) : healthStatus === "ready" && bookingEnabled ? (
                <>
                  {/* Step indicator */}
                  <StepIndicator currentStep={step} />

                  {/* Step content */}
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                      {/* ======================== STEP 1: Service ======================== */}
                      {step === 1 && (
                        <motion.div
                          key="step-1"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={slideTransition}
                          className="absolute inset-0 flex flex-col px-5 py-5 md:px-6 md:py-6"
                        >
                          <div className="shrink-0">
                            <p className="mb-1.5 text-base font-semibold text-[var(--ink)]">
                              Che servizio ti serve?
                            </p>
                            <p className="mb-5 max-w-md text-sm leading-relaxed text-[var(--ink)]/55">
                              Seleziona il servizio per cui vuoi prenotare un appuntamento.
                            </p>
                          </div>

                          <div className="grid min-h-0 flex-1 grid-cols-2 gap-px overflow-hidden bg-[var(--ink)]/10">
                            {BOOKING_SERVICE_OPTIONS.map((item, index) => {
                              const isSelected = service === item.value;
                              return (
                                <motion.button
                                  key={item.value}
                                  type="button"
                                  onClick={() => setService(item.value)}
                                  initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
                                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                                  transition={
                                    reducedMotion
                                      ? { duration: 0 }
                                      : { delay: index * 0.04, duration: 0.35 }
                                  }
                                  className={`group relative flex h-full min-h-0 items-start gap-3 p-3.5 text-left transition-colors active:scale-[0.99] sm:gap-4 sm:p-4 ${
                                    isSelected
                                      ? "bg-[var(--ink)] text-white"
                                      : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
                                  }`}
                                >
                                  <div
                                    className={`shrink-0 transition-colors [&_svg]:h-6 [&_svg]:w-6 ${
                                      isSelected ? "text-[#22d3ee]" : "text-[var(--ink)]/45 group-hover:text-[#5E0ED7]"
                                    }`}
                                  >
                                    {SERVICE_ICONS[item.value] || null}
                                  </div>
                                  <div className="min-w-0 pr-4">
                                    <p
                                      className={`text-[11px] font-bold uppercase leading-snug tracking-[0.06em] sm:text-sm ${
                                        isSelected ? "text-white" : "text-[var(--ink)]"
                                      }`}
                                    >
                                      {item.label}
                                    </p>
                                    <p
                                      className={`mt-1 line-clamp-2 text-[11px] leading-relaxed sm:text-xs ${
                                        isSelected ? "text-white/70" : "text-[var(--ink)]/55"
                                      }`}
                                    >
                                      {item.description}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center bg-[#22d3ee] text-[var(--ink)]">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>

                          <div className="mt-5 flex shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={goForward}
                              disabled={!service}
                              className="brutal-cta-ink inline-flex min-h-[44px] items-center gap-2 bg-[var(--ink)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Continua
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ======================== STEP 2: Date + Time ======================== */}
                      {step === 2 && (
                        <motion.div
                          key="step-2"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={slideTransition}
                          className="absolute inset-0 flex flex-col px-5 py-5 md:px-6 md:py-6"
                        >
                          <div className="mb-4 flex shrink-0 items-center gap-3 border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3 py-2.5">
                            <div className="text-[#5E0ED7] [&_svg]:h-5 [&_svg]:w-5">
                              {SERVICE_ICONS[service] || null}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--ink)] sm:text-sm">
                                {selectedServiceMeta?.label}
                              </p>
                            </div>
                          </div>

                          <div className="min-h-0 flex-1 space-y-4 overflow-hidden">
                            <div>
                              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45">
                                Scegli la data
                              </span>
                              <CalendarPicker
                                value={date}
                                onChange={setDate}
                                minDate={getNextBookableDateValue()}
                              />
                              <p className="mt-2 text-[11px] leading-relaxed text-[var(--ink)]/50">
                                Lun-ven 09:00-13:00 e 16:20-18:30, sab 09:20-12:30. Domenica chiuso.
                              </p>
                            </div>

                            <div>
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45">
                                Orari disponibili
                              </p>

                              {slotStatus === "loading" && (
                                <div className="flex items-center gap-3 border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-3 text-sm text-[var(--ink)]/70">
                                  <svg className="h-5 w-5 animate-spin text-[#5E0ED7]" viewBox="0 0 24 24" fill="none">
                                    <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} className="opacity-20" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                                  </svg>
                                  Sto cercando gli slot liberi...
                                </div>
                              )}

                              {(slotStatus === "error" || slotMessage) && (
                                <p
                                  role="alert"
                                  className={`border p-3 text-sm ${
                                    slotStatus === "error"
                                      ? "border-red-700/25 bg-red-50 text-red-900"
                                      : "border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] text-[var(--ink)]/70"
                                  }`}
                                >
                                  {slotMessage}
                                </p>
                              )}

                              {slotStatus === "ready" && slots.length > 0 && (
                                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                                  {slots.map((slot) => {
                                    const slotTime = slot.start.slice(11, 16);
                                    const active = selectedTime === slotTime;
                                    return (
                                      <button
                                        key={slot.start}
                                        type="button"
                                        onClick={() => setSelectedTime(slotTime)}
                                        className={`min-h-[40px] border px-2 py-2 text-sm font-bold transition active:scale-[0.98] ${
                                          active
                                            ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                                            : "border-[var(--ink)]/15 text-[var(--ink)] hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                                        }`}
                                      >
                                        {formatSlotLabel(slot.start)}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex shrink-0 items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={goBack}
                              className="inline-flex min-h-[44px] items-center gap-2 border border-[var(--ink)]/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M19 12H5" />
                                <path d="m12 19-7-7 7-7" />
                              </svg>
                              Indietro
                            </button>
                            <button
                              type="button"
                              onClick={goForward}
                              disabled={!canContinueStep2}
                              className="brutal-cta-ink inline-flex min-h-[44px] items-center gap-2 bg-[var(--ink)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Continua
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ======================== STEP 3: Contact Details ======================== */}
                      {step === 3 && (
                        <motion.div
                          key="step-3"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={slideTransition}
                          className="absolute inset-0 flex flex-col px-5 py-5 md:px-6 md:py-6"
                        >
                          <div className="mb-4 flex shrink-0 items-center gap-3 border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3 py-2.5">
                            <div className="text-[#5E0ED7] [&_svg]:h-5 [&_svg]:w-5">
                              {SERVICE_ICONS[service] || null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--ink)] sm:text-sm">
                                {selectedServiceMeta?.label}
                              </p>
                              <p className="text-[11px] text-[var(--ink)]/55">
                                {date} alle {selectedTime}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setDirection(-1);
                                setStep(2);
                              }}
                              className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E0ED7] transition hover:text-[var(--ink)]"
                            >
                              Modifica
                            </button>
                          </div>

                          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 space-y-3.5">
                              <label className="block">
                                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45">
                                  Nome e cognome
                                </span>
                                <input
                                  ref={nameInputRef}
                                  value={name}
                                  onChange={(event) => setName(event.target.value)}
                                  className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                  placeholder="Come ti chiami"
                                  autoComplete="name"
                                  required
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45">
                                  Email
                                </span>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(event) => setEmail(event.target.value)}
                                  className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                  placeholder="nome@dominio.it"
                                  autoComplete="email"
                                  required
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45">
                                  Telefono
                                </span>
                                <input
                                  value={phone}
                                  onChange={(event) => setPhone(event.target.value)}
                                  className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                  placeholder="Il numero su cui ricontattarti"
                                  autoComplete="tel"
                                  required
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45">
                                  Note (facoltativo)
                                </span>
                                <textarea
                                  value={notes}
                                  onChange={(event) => setNotes(event.target.value)}
                                  rows={2}
                                  className="min-h-0 w-full resize-none border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                  placeholder="Scrivi in breve cosa vuoi affrontare, così arrivo già preparato."
                                />
                              </label>

                              {submitStatus === "error" && submitMessage && (
                                <div
                                  role="alert"
                                  className="border border-red-700/25 bg-red-50 px-3 py-2.5 text-sm text-red-900"
                                >
                                  {submitMessage}
                                </div>
                              )}
                            </div>

                            <div className="mt-5 shrink-0 space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={goBack}
                                  className="inline-flex min-h-[44px] items-center gap-2 border border-[var(--ink)]/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M19 12H5" />
                                    <path d="m12 19-7-7 7-7" />
                                  </svg>
                                  Indietro
                                </button>
                                <button
                                  type="submit"
                                  disabled={submitStatus === "loading"}
                                  className="brutal-cta-ink inline-flex min-h-[44px] items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {submitStatus === "loading" ? (
                                    <>
                                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} className="opacity-20" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                                      </svg>
                                      Sto bloccando lo slot...
                                    </>
                                  ) : (
                                    <>
                                      Conferma
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </>
                                  )}
                                </button>
                              </div>

                              <p className="text-center text-[11px] leading-relaxed text-[var(--ink)]/45">
                                L&apos;appuntamento viene confermato solo sugli slot realmente liberi nel
                                calendario operativo.
                              </p>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : null}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
