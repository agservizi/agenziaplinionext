"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = {
  start: string;
  end: string;
  label: string;
};

type FormState = "idle" | "loading" | "success" | "error";

const services = [
  "Pagamenti",
  "Telefonia",
  "Energia",
  "SPID / PEC / Firma Digitale",
  "Spedizioni",
  "Consulenza Web / Gestionale",
];

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(service);
    if (step === 1) return Boolean(date && selectedSlot);
    if (step === 2) return Boolean(name && email && phone);
    return false;
  }, [date, email, name, phone, selectedSlot, service, step]);

  useEffect(() => {
    if (!date || !service) return;
    setLoadingSlots(true);
    setSlotsError("");
    setSelectedSlot(null);

    fetch(`/api/booking/availability?date=${date}&service=${encodeURIComponent(service)}`)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.message || "Errore disponibilità");
        }
        return response.json();
      })
      .then((data) => setSlots(data.slots || []))
      .catch((error) => setSlotsError(error instanceof Error ? error.message : "Errore"))
      .finally(() => setLoadingSlots(false));
  }, [date, service]);

  async function handleSubmit() {
    if (state === "loading" || !selectedSlot) return;
    setState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          date,
          time: selectedSlot.label,
          name,
          email,
          phone,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Prenotazione non riuscita");
      }

      setState("success");
      setMessage("Prenotazione confermata! Riceverai una email di conferma.");
      setStep(3);
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Si è verificato un errore. Riprova.",
      );
    }
  }

  function handleNext() {
    if (!canContinue) return;
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        {["Servizio", "Data & Ora", "Dati", "Conferma"].map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={
                index <= step
                  ? "flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white"
                  : "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-400"
              }
            >
              {index + 1}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {label}
            </span>
            {index < 3 ? <span className="h-px w-6 bg-slate-200" /> : null}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setService(item)}
              className={
                service === item
                  ? "rounded-2xl border border-cyan-500 bg-cyan-50 px-5 py-4 text-left text-sm font-semibold text-cyan-700"
                  : "rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-700"
              }
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <label className="space-y-2 text-sm text-slate-700">
            Seleziona una data
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Slot disponibili</p>
            {loadingSlots ? (
              <p className="text-sm text-slate-500">Caricamento disponibilità...</p>
            ) : null}
            {slotsError ? <p className="text-sm text-rose-600">{slotsError}</p> : null}
            {!loadingSlots && !slotsError && date ? (
              slots.length ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={
                        selectedSlot?.start === slot.start
                          ? "rounded-2xl border border-cyan-500 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700"
                          : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                      }
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nessuno slot disponibile.</p>
              )
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Nome e cognome
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Telefono
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            Note (opzionali)
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-semibold text-slate-900">Riepilogo appuntamento</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p>Servizio: {service}</p>
            <p>Data: {date}</p>
            <p>Orario: {selectedSlot?.label}</p>
            <p>Cliente: {name}</p>
            <p>Email: {email}</p>
            <p>Telefono: {phone}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 && step < 3 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
            >
              Indietro
            </button>
          ) : null}
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continua
            </button>
          ) : null}
          {step === 2 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Riepilogo
            </button>
          ) : null}
          {step === 3 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={state === "loading"}
              className="rounded-full bg-cyan-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-400"
            >
              {state === "loading" ? "Prenotazione..." : "Conferma prenotazione"}
            </button>
          ) : null}
        </div>
        {message ? (
          <p className={state === "success" ? "text-sm text-emerald-600" : "text-sm text-rose-600"}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
