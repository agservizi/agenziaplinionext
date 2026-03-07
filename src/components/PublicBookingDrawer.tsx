"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BOOKING_SERVICE_OPTIONS, resolveClientBookingApiBase } from "@/lib/booking-api";

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

export default function PublicBookingDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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

  const selectedServiceMeta = BOOKING_SERVICE_OPTIONS.find((item) => item.value === service);

  return (
    <>
      <div
        className={
          open
            ? "fixed inset-0 z-[60] bg-slate-950/70 opacity-100 transition-opacity"
            : "pointer-events-none fixed inset-0 z-[60] bg-slate-950/70 opacity-0 transition-opacity"
        }
        onClick={onClose}
      />
      <aside
        className={
          open
            ? "fixed right-0 top-0 z-[70] h-[100svh] w-full max-w-xl translate-x-0 overflow-y-auto bg-slate-950 text-white shadow-2xl transition-transform"
            : "fixed right-0 top-0 z-[70] h-[100svh] w-full max-w-xl translate-x-full overflow-y-auto bg-slate-950 text-white shadow-2xl transition-transform"
        }
        aria-hidden={!open}
      >
        <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.22),_transparent_38%),linear-gradient(180deg,#020617_0%,#020617_55%,#0f172a_100%)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Prenotazione rapida
              </p>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                Fissa un appuntamento senza uscire dal sito.
              </h2>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Scegli il servizio, blocca uno slot disponibile e ricevi conferma subito nel
                calendario operativo.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
            >
              Chiudi
            </button>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              Servizio selezionato
            </p>
            <div className="mt-3 rounded-3xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-base font-semibold text-white">{selectedServiceMeta?.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedServiceMeta?.description}
              </p>
            </div>
          </div>

          {healthStatus === "loading" ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              Sto controllando il calendario disponibile...
            </div>
          ) : null}

          {healthStatus === "error" ? (
            <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-100">
              {healthMessage}
            </div>
          ) : null}

          {healthStatus === "ready" && bookingEnabled ? (
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Servizio</span>
                    <select
                      value={service}
                      onChange={(event) => setService(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    >
                      {BOOKING_SERVICE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Data</span>
                    <input
                      type="date"
                      min={getNextBookableDateValue()}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      required
                    />
                  </label>
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-400">
                  Orari prenotabili: lunedi-venerdi 09:00-13:00 e 16:20-18:30, sabato 09:20-12:30.
                  Domenica chiuso.
                </p>

                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-200">Orari disponibili</p>
                  {slotStatus === "loading" ? (
                    <p className="mt-3 text-sm text-slate-300">Sto cercando gli slot liberi...</p>
                  ) : null}
                  {slotStatus === "error" || slotMessage ? (
                    <p
                      className={`mt-3 text-sm ${
                        slotStatus === "error" ? "text-red-300" : "text-slate-300"
                      }`}
                    >
                      {slotMessage}
                    </p>
                  ) : null}
                  {slotStatus === "ready" && slots.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {slots.map((slot) => {
                        const slotTime = slot.start.slice(11, 16);
                        const active = selectedTime === slotTime;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedTime(slotTime)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                              active
                                ? "border-cyan-300 bg-cyan-500 text-slate-950"
                                : "border-white/10 bg-slate-900/70 text-slate-200 hover:border-cyan-400/50"
                            }`}
                          >
                            {formatSlotLabel(slot.start)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Nome e cognome</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      placeholder="Come ti chiami"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      placeholder="nome@dominio.it"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Telefono</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      placeholder="Il numero su cui ricontattarti"
                      autoComplete="tel"
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Note</span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      placeholder="Scrivi in breve cosa vuoi affrontare, così arrivo già preparato."
                    />
                  </label>
                </div>

                {submitMessage ? (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      submitStatus === "success"
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                        : "border-red-400/30 bg-red-500/10 text-red-100"
                    }`}
                  >
                    <p>{submitMessage}</p>
                    {submitStatus === "success" && confirmedStart ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-200/90">
                        {formatAppointmentDate(confirmedStart)}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-6 text-slate-400">
                    L&apos;appuntamento viene confermato solo sugli slot realmente liberi nel
                    calendario operativo.
                  </p>
                  <button
                    type="submit"
                    disabled={submitStatus === "loading" || !selectedTime}
                    className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitStatus === "loading" ? "Sto bloccando lo slot..." : "Conferma prenotazione"}
                  </button>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </aside>
    </>
  );
}
