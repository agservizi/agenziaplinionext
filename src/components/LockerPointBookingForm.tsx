"use client";

/**
 * Fact-forcing: locker Stripe checkout CTA; import PaymentCheckoutNotice.
 * Callers: deposito-bagagli / locker pages. User: "procedi su tutto al 100% … chiudiamo questo GAP".
 */
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/it";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { itIT } from "@mui/x-date-pickers/locales";
import PaymentCheckoutNotice from "@/components/compliance/PaymentCheckoutNotice";

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

const LOCKER_CHECKOUT_DRAFT_KEY = "ag:locker-checkout-draft";

type LockerCheckoutDraft = FormState & { days: number };

function lockerApiMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== "object") return fallback;
  const o = json as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) return o.message;
  const err = o.error;
  if (
    err &&
    typeof err === "object" &&
    typeof (err as { message?: string }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}

function buildLockerReturnPath(): string {
  if (typeof window === "undefined") return "/fermo-deposito";
  const qs = new URLSearchParams(window.location.search);
  qs.delete("locker_checkout");
  qs.delete("session_id");
  const path = window.location.pathname;
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}

function lockerConfermaParams(data: Record<string, unknown>): string {
  const params = new URLSearchParams({
    code: String(data.code ?? ""),
  });
  if (data.pickupUrl) params.set("pickupUrl", String(data.pickupUrl));
  if (data.dailyRate != null) params.set("dailyRate", String(data.dailyRate));
  if (data.expectedPickupDate)
    params.set("date", String(data.expectedPickupDate));
  return params.toString();
}

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

const inputClassPublic =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30";

const labelClassPublic =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/45";

const inputClassCompact =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";

const labelClassCompact =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45";

const datePickerTextFieldSxCompact = {
  "& .MuiInputBase-root, & .MuiPickersInputBase-root": {
    height: 44,
    borderRadius: 0,
    backgroundColor: "color-mix(in srgb, var(--paper) 88%, white)",
    color: "var(--ink)",
    fontSize: "0.875rem",
  },
  "& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "color-mix(in srgb, var(--ink) 15%, transparent)",
    },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline, & .MuiPickersInputBase-root:hover .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "color-mix(in srgb, var(--ink) 25%, transparent)",
    },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline, & .MuiPickersInputBase-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "#5E0ED7",
    },
  "& .MuiInputBase-input, & .MuiPickersInputBase-input, & .MuiPickersSectionList-root":
    {
      padding: "10px 14px",
      color: "var(--ink)",
      WebkitTextFillColor: "var(--ink)",
    },
  "& .MuiPickersSectionList-sectionContent, & .MuiPickersSectionList-sectionSeparator":
    {
      color: "var(--ink)",
      WebkitTextFillColor: "var(--ink)",
    },
  "& .MuiSvgIcon-root": {
    color: "color-mix(in srgb, var(--ink) 55%, transparent)",
  },
};

const datePickerPaperSxCompact = {
  backgroundColor: "var(--paper)",
  border: "1px solid color-mix(in srgb, var(--ink) 15%, transparent)",
  color: "var(--ink) !important",
  "& .MuiPickersLayout-root *": {
    color: "color-mix(in srgb, var(--ink) 88%, transparent) !important",
    WebkitTextFillColor: "color-mix(in srgb, var(--ink) 88%, transparent) !important",
  },
  "& .MuiButtonBase-root.MuiPickersDay-root.Mui-selected": {
    backgroundColor: "#5E0ED7",
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important",
  },
};

const CTA_COMPACT =
  "brutal-cta-ink flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

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
  const inputClass = compact ? inputClassCompact : inputClassPublic;
  const labelClass = compact ? labelClassCompact : labelClassPublic;
  const dateFieldSx = compact
    ? datePickerTextFieldSxCompact
    : datePickerTextFieldSx;
  const datePaperSx = compact ? datePickerPaperSxCompact : datePickerPaperSx;
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
  const [checkoutHandled, setCheckoutHandled] = useState(false);
  const [verifyingCheckout, setVerifyingCheckout] = useState(false);

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
    !submitting &&
    !verifyingCheckout;

  const cleanLockerCheckoutQuery = useCallback(() => {
    if (typeof window === "undefined") return;
    const qs = new URLSearchParams(window.location.search);
    qs.delete("locker_checkout");
    qs.delete("session_id");
    const q = qs.toString();
    const path = window.location.pathname;
    router.replace(q ? `${path}?${q}` : path);
  }, [router]);

  useEffect(() => {
    if (checkoutHandled || typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const checkoutState = search.get("locker_checkout");
    if (!checkoutState) return;

    setCheckoutHandled(true);
    let draft: LockerCheckoutDraft | null = null;
    try {
      draft = JSON.parse(
        sessionStorage.getItem(LOCKER_CHECKOUT_DRAFT_KEY) || "null",
      ) as LockerCheckoutDraft | null;
    } catch {
      draft = null;
    }

    if (checkoutState === "cancel") {
      if (draft) setForm(draft);
      setError("Pagamento annullato. Puoi riprovare quando vuoi.");
      cleanLockerCheckoutQuery();
      return;
    }

    const sessionId = search.get("session_id") || "";
    if (checkoutState !== "success" || !sessionId) {
      cleanLockerCheckoutQuery();
      return;
    }

    if (!draft) {
      setError(
        "Sessione di pagamento scaduta. Compila di nuovo il modulo e riprova.",
      );
      cleanLockerCheckoutQuery();
      return;
    }

    const verifyLockKey = `ag:locker-verify:${sessionId}`;
    if (sessionStorage.getItem(verifyLockKey) === "done") {
      cleanLockerCheckoutQuery();
      return;
    }
    if (sessionStorage.getItem(verifyLockKey) === "pending") {
      setForm(draft);
      setVerifyingCheckout(true);
      setSubmitting(true);
      return;
    }
    sessionStorage.setItem(verifyLockKey, "pending");

    setForm(draft);
    setVerifyingCheckout(true);
    setSubmitting(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetch("/api/locker-point/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            recipientName: draft!.recipientName.trim(),
            recipientEmail: draft!.recipientEmail.trim() || undefined,
            recipientPhone: draft!.recipientPhone.trim() || undefined,
            senderName: draft!.senderName.trim() || undefined,
            carrier: draft!.carrier.trim() || undefined,
            trackingCode: draft!.trackingCode.trim() || undefined,
            expectedPickupDate: draft!.expectedPickupDate,
            notes: draft!.notes.trim() || undefined,
          }),
        });
        const json = await res.json();
        const data = (json?.data ?? json) as Record<string, unknown>;
        if (!res.ok || json?.success === false || !data?.code) {
          throw new Error(
            lockerApiMessage(
              json,
              "Verifica pagamento non riuscita. Contattaci.",
            ),
          );
        }
        sessionStorage.removeItem(LOCKER_CHECKOUT_DRAFT_KEY);
        sessionStorage.setItem(verifyLockKey, "done");
        cleanLockerCheckoutQuery();
        router.push(`/fermo-deposito/conferma?${lockerConfermaParams(data)}`);
      } catch (cause) {
        sessionStorage.removeItem(verifyLockKey);
        if (draft) setForm(draft);
        setError(
          cause instanceof Error
            ? cause.message
            : "Verifica pagamento non riuscita.",
        );
        cleanLockerCheckoutQuery();
        setSubmitting(false);
        setVerifyingCheckout(false);
      }
    })();
  }, [checkoutHandled, cleanLockerCheckoutQuery, router]);

  const bookLockerDirect = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch("/api/locker-point/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      const data = (json?.data ?? json) as Record<string, unknown>;
      if (!res.ok || json?.success === false || !data?.code) {
        throw new Error(
          lockerApiMessage(
            json,
            "Non siamo riusciti a completare la prenotazione. Riprova o contattaci.",
          ),
        );
      }
      router.push(`/fermo-deposito/conferma?${lockerConfermaParams(data)}`);
    },
    [router],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setSubmitting(true);
      setError(null);
      let redirectingToCheckout = false;
      try {
        const bookBody = {
          recipientName: form.recipientName.trim(),
          recipientEmail: form.recipientEmail.trim() || undefined,
          recipientPhone: form.recipientPhone.trim() || undefined,
          senderName: form.senderName.trim() || undefined,
          carrier: form.carrier.trim() || undefined,
          trackingCode: form.trackingCode.trim() || undefined,
          expectedPickupDate: form.expectedPickupDate,
          notes: form.notes.trim() || undefined,
        };

        const draft: LockerCheckoutDraft = {
          ...form,
          recipientName: form.recipientName.trim(),
          days: 1,
        };

        const checkoutRes = await fetch("/api/locker-point/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookBody,
            days: 1,
            returnPath: buildLockerReturnPath(),
          }),
        });

        if (checkoutRes.status === 503) {
          await bookLockerDirect(bookBody);
          return;
        }

        const checkoutJson = await checkoutRes.json();
        if (!checkoutRes.ok) {
          throw new Error(
            lockerApiMessage(checkoutJson, "Pagamento non disponibile. Riprova."),
          );
        }

        const checkoutUrl =
          checkoutJson && typeof checkoutJson.url === "string"
            ? checkoutJson.url
            : "";
        if (!checkoutUrl) {
          throw new Error("URL di pagamento non disponibile.");
        }

        sessionStorage.setItem(LOCKER_CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
        redirectingToCheckout = true;
        window.location.assign(checkoutUrl);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Servizio temporaneamente non disponibile. Riprova tra poco.",
        );
      } finally {
        if (!redirectingToCheckout) setSubmitting(false);
      }
    },
    [bookLockerDirect, canSubmit, form],
  );

  const today = dayjs().format("YYYY-MM-DD");

  if (!loadingPricing && pricing && !pricing.onlineIntakeEnabled) {
    return (
      <div
        className={
          compact
            ? "border border-amber-600/25 bg-amber-500/10 p-6 text-sm text-amber-900"
            : "rounded-2xl border border-amber-400/25 bg-amber-500/10 p-6 text-sm text-amber-100"
        }
      >
        Al momento le prenotazioni online sono sospese. Passa in agenzia in Via
        Plinio il Vecchio 72 oppure chiamaci.
      </div>
    );
  }

  const formBody = (
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
                  sx: dateFieldSx,
                },
                desktopPaper: { sx: datePaperSx },
                mobilePaper: { sx: datePaperSx },
              }}
            />
            {form.expectedPickupDate && (
              <div className="mt-2">
                {loadingAvailability ? (
                  <p
                    className={`text-xs ${compact ? "text-[var(--ink)]/45" : "text-white/40"}`}
                  >
                    Verifica disponibilità…
                  </p>
                ) : availability ? (
                  <p
                    className={`text-xs ${
                      availability.available
                        ? compact
                          ? "text-emerald-700"
                          : "text-emerald-300"
                        : compact
                          ? "text-rose-700"
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
            className={
              compact
                ? "text-xs font-bold uppercase tracking-[0.12em] text-[#5E0ED7] transition hover:underline"
                : "text-xs font-medium text-[#22d3ee]/80 transition hover:text-[#22d3ee]"
            }
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
            className={
              compact
                ? "border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800"
                : "rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            }
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={
            compact
              ? CTA_COMPACT
              : `flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
                  canSubmit
                    ? "bg-linear-to-r from-[#5E0ED7] to-[#22d3ee] text-white shadow-lg shadow-[#5E0ED7]/25 hover:scale-[1.01] hover:shadow-xl"
                    : "cursor-not-allowed bg-white/10 text-white/35"
                }`
          }
        >
          {verifyingCheckout
            ? "Conferma pagamento in corso…"
            : submitting
              ? "Reindirizzamento al pagamento…"
              : "Prenota fermo deposito"}
        </button>

        <p
          className={`text-center text-[11px] leading-relaxed ${
            compact ? "text-[var(--ink)]/45" : "text-white/40"
          }`}
        >
          Ricevi un codice LP da mostrare al ritiro. Tariffa da{" "}
          <span className={compact ? "text-[var(--ink)]/70" : "text-white/70"}>
            &euro;
            {(pricing?.dailyRate ?? 0.5).toFixed(2).replace(".", ",")} al giorno
          </span>
          , per pacco.
        </p>
        <PaymentCheckoutNotice
          className={`text-center ${compact ? "" : "!text-white/45 [&_a]:!text-cyan-200 [&_strong]:!text-white/70"}`}
          amountLabel={`da ${(pricing?.dailyRate ?? 0.5).toFixed(2).replace(".", ",")} €/giorno`}
        />
      </form>
  );

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="it"
      localeText={itIT.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {compact ? (
        <div className="px-5 pb-8 pt-6 md:px-8">
          <section className="border border-[var(--ink)]/12 bg-[var(--paper)] p-5 md:p-7">
            {formBody}
          </section>
        </div>
      ) : (
        formBody
      )}
    </LocalizationProvider>
  );
}
