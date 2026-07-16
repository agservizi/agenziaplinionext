"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/it";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { itIT } from "@mui/x-date-pickers/locales";

dayjs.locale("it");

export type LockerPricing = {
  dailyRate: number;
  currency: string;
  onlineIntakeEnabled: boolean;
  bookingInstructions?: string | null;
  pricingNote?: string | null;
  maxDailyCapacity?: number;
};

export type LockerAvailability = {
  available: boolean;
  availablePackages: number;
  maxCapacity?: number;
};

type FormState = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  senderName: string;
  carrier: string;
  trackingCode: string;
  expectedPickupDate: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  recipientName: "",
  recipientEmail: "",
  recipientPhone: "",
  senderName: "",
  carrier: "",
  trackingCode: "",
  expectedPickupDate: "",
  notes: "",
};

const datePickerTextFieldSx = {
  "& .MuiInputBase-root, & .MuiPickersInputBase-root": {
    height: 44,
    borderRadius: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    fontSize: "0.875rem",
  },
  "& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline, & .MuiPickersInputBase-root:hover .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "rgba(255, 255, 255, 0.25)",
    },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline, & .MuiPickersInputBase-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "rgba(34, 211, 238, 0.5)",
    },
  "& .MuiInputBase-input, & .MuiPickersInputBase-input, & .MuiPickersSectionList-root":
    {
      padding: "10px 12px",
      color: "#fff",
      WebkitTextFillColor: "#fff",
    },
  "& .MuiPickersSectionList-sectionContent, & .MuiPickersSectionList-sectionSeparator":
    {
      color: "#fff",
      WebkitTextFillColor: "#fff",
    },
  "& .MuiSvgIcon-root": {
    color: "rgba(255, 255, 255, 0.55)",
  },
};

const datePickerPaperSx = {
  backgroundColor: "#0f1d32",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  color: "#fff !important",
  "& .MuiPickersLayout-root *": {
    color: "rgba(255, 255, 255, 0.88) !important",
    WebkitTextFillColor: "rgba(255, 255, 255, 0.88) !important",
  },
  "& .MuiButtonBase-root.MuiPickersDay-root.Mui-selected": {
    backgroundColor: "#22d3ee",
    color: "#082033 !important",
    WebkitTextFillColor: "#082033 !important",
  },
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30";

const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/45";

type Props = {
  initialDate?: string;
  compact?: boolean;
  onPricingLoaded?: (pricing: LockerPricing) => void;
};

export default function LockerPointBookingForm({
  initialDate = "",
  compact = false,
  onPricingLoaded,
}: Props) {
  const router = useRouter();
  const formId = useId();
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    expectedPickupDate: initialDate,
  });
  const [pricing, setPricing] = useState<LockerPricing | null>(null);
  const [availability, setAvailability] = useState<LockerAvailability | null>(
    null,
  );
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(!compact);

  useEffect(() => {
    if (initialDate) {
      setForm((prev) =>
        prev.expectedPickupDate
          ? prev
          : { ...prev, expectedPickupDate: initialDate },
      );
    }
  }, [initialDate]);

  useEffect(() => {
    let cancelled = false;
    async function loadPricing() {
      setLoadingPricing(true);
      try {
        const res = await fetch("/api/locker-point/pricing");
        const json = await res.json();
        const data = json?.data ?? json;
        if (!cancelled && json?.success !== false && data?.dailyRate != null) {
          const next: LockerPricing = {
            dailyRate: Number(data.dailyRate),
            currency: data.currency || "EUR",
            onlineIntakeEnabled: data.onlineIntakeEnabled !== false,
            bookingInstructions: data.bookingInstructions,
            pricingNote: data.pricingNote,
            maxDailyCapacity: data.maxDailyCapacity,
          };
          setPricing(next);
          onPricingLoaded?.(next);
        }
      } catch {
        /* keep null */
      } finally {
        if (!cancelled) setLoadingPricing(false);
      }
    }
    loadPricing();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount; parent callback is optional display-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const date = form.expectedPickupDate;
    if (!date) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    async function loadAvailability() {
      try {
        const res = await fetch(
          `/api/locker-point/availability?date=${encodeURIComponent(date)}`,
        );
        const json = await res.json();
        const data = json?.data ?? json;
        if (!cancelled && json?.success !== false) {
          setAvailability({
            available: Boolean(data.available),
            availablePackages: Number(
              data.available_packages ?? data.availablePackages ?? 0,
            ),
            maxCapacity: data.max_capacity ?? data.maxCapacity,
          });
        } else if (!cancelled) {
          setAvailability(null);
        }
      } catch {
        if (!cancelled) setAvailability(null);
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    }
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [form.expectedPickupDate]);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    [],
  );

  const onlineEnabled = pricing?.onlineIntakeEnabled !== false;
  const canSubmit =
    onlineEnabled &&
    form.recipientName.trim().length > 1 &&
    Boolean(form.expectedPickupDate) &&
    availability?.available !== false &&
    !submitting;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/locker-point/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientName: form.recipientName.trim(),
            recipientEmail: form.recipientEmail.trim() || undefined,
            recipientPhone: form.recipientPhone.trim() || undefined,
            senderName: form.senderName.trim() || undefined,
            carrier: form.carrier.trim() || undefined,
            trackingCode: form.trackingCode.trim() || undefined,
            expectedPickupDate: form.expectedPickupDate,
            notes: form.notes.trim() || undefined,
          }),
        });
        const json = await res.json();
        const data = json?.data ?? json;
        if (!res.ok || json?.success === false || !data?.code) {
          setError(
            json?.error?.message ||
              "Non siamo riusciti a completare la prenotazione. Riprova o contattaci.",
          );
          return;
        }
        const params = new URLSearchParams({ code: String(data.code) });
        if (data.pickupUrl) params.set("pickupUrl", String(data.pickupUrl));
        if (data.dailyRate != null)
          params.set("dailyRate", String(data.dailyRate));
        if (data.expectedPickupDate)
          params.set("date", String(data.expectedPickupDate));
        router.push(`/fermo-deposito/conferma?${params.toString()}`);
      } catch {
        setError("Servizio temporaneamente non disponibile. Riprova tra poco.");
      } finally {
        setSubmitting(false);
      }
    },
    [canSubmit, form, router],
  );

  const today = dayjs().format("YYYY-MM-DD");

  if (!loadingPricing && pricing && !pricing.onlineIntakeEnabled) {
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-6 text-sm text-amber-100">
        Al momento le prenotazioni online sono sospese. Passa in agenzia in Via
        Plinio il Vecchio 72 oppure chiamaci.
      </div>
    );
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="it"
      localeText={itIT.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
          <div className={compact ? "" : "sm:col-span-2"}>
            <label htmlFor={`${formId}-name`} className={labelClass}>
              Destinatario *
            </label>
            <input
              id={`${formId}-name`}
              name="recipientName"
              required
              autoComplete="name"
              value={form.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              placeholder="Nome e cognome"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`${formId}-date`} className={labelClass}>
              Ritiro previsto *
            </label>
            <DatePicker
              value={
                form.expectedPickupDate
                  ? dayjs(form.expectedPickupDate)
                  : null
              }
              minDate={dayjs(today)}
              onChange={(value) => {
                update(
                  "expectedPickupDate",
                  value?.isValid() ? value.format("YYYY-MM-DD") : "",
                );
              }}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  id: `${formId}-date`,
                  fullWidth: true,
                  size: "small",
                  required: true,
                  sx: datePickerTextFieldSx,
                },
                desktopPaper: { sx: datePickerPaperSx },
                mobilePaper: { sx: datePickerPaperSx },
              }}
            />
            {form.expectedPickupDate && (
              <div className="mt-2">
                {loadingAvailability ? (
                  <p className="text-xs text-white/40">
                    Verifica disponibilità…
                  </p>
                ) : availability ? (
                  <p
                    className={`text-xs ${
                      availability.available
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {availability.available
                      ? `${availability.availablePackages} post${
                          availability.availablePackages === 1 ? "o" : "i"
                        } disponibili`
                      : "Capacità esaurita per questa data"}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-phone`} className={labelClass}>
              Telefono
            </label>
            <input
              id={`${formId}-phone`}
              name="recipientPhone"
              type="tel"
              autoComplete="tel"
              value={form.recipientPhone}
              onChange={(e) => update("recipientPhone", e.target.value)}
              placeholder="+39 …"
              className={inputClass}
            />
          </div>

          {!compact && (
            <div>
              <label htmlFor={`${formId}-email`} className={labelClass}>
                Email
              </label>
              <input
                id={`${formId}-email`}
                name="recipientEmail"
                type="email"
                autoComplete="email"
                value={form.recipientEmail}
                onChange={(e) => update("recipientEmail", e.target.value)}
                placeholder="tua@email.it"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="text-xs font-medium text-[#22d3ee]/80 transition hover:text-[#22d3ee]"
          >
            {showOptional
              ? "Nascondi dettagli opzionali"
              : "Aggiungi tracking, corriere, note…"}
          </button>
        )}

        {showOptional && (
          <div className="grid gap-4 sm:grid-cols-2">
            {compact && (
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-email-opt`} className={labelClass}>
                  Email
                </label>
                <input
                  id={`${formId}-email-opt`}
                  name="recipientEmail"
                  type="email"
                  autoComplete="email"
                  value={form.recipientEmail}
                  onChange={(e) => update("recipientEmail", e.target.value)}
                  placeholder="tua@email.it"
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label htmlFor={`${formId}-carrier`} className={labelClass}>
                Corriere
              </label>
              <input
                id={`${formId}-carrier`}
                name="carrier"
                value={form.carrier}
                onChange={(e) => update("carrier", e.target.value)}
                placeholder="Amazon, BRT, GLS…"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${formId}-tracking`} className={labelClass}>
                Codice tracking
              </label>
              <input
                id={`${formId}-tracking`}
                name="trackingCode"
                value={form.trackingCode}
                onChange={(e) => update("trackingCode", e.target.value)}
                placeholder="Es. TBA123…"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${formId}-sender`} className={labelClass}>
                Mittente
              </label>
              <input
                id={`${formId}-sender`}
                name="senderName"
                value={form.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                placeholder="Negozio o mittente"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`${formId}-notes`} className={labelClass}>
                Note
              </label>
              <textarea
                id={`${formId}-notes`}
                name="notes"
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Pacco fragile, dimensioni, indicazioni…"
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
            canSubmit
              ? "bg-linear-to-r from-[#5E0ED7] to-[#22d3ee] text-white shadow-lg shadow-[#5E0ED7]/25 hover:scale-[1.01] hover:shadow-xl"
              : "cursor-not-allowed bg-white/10 text-white/35"
          }`}
        >
          {submitting ? "Prenotazione in corso…" : "Prenota fermo deposito"}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-white/40">
          Ricevi un codice LP da mostrare al ritiro. Tariffa da{" "}
          <span className="text-white/70">
            &euro;
            {(pricing?.dailyRate ?? 0.5).toFixed(2).replace(".", ",")} al giorno
          </span>
          , per pacco.
        </p>
      </form>
    </LocalizationProvider>
  );
}
