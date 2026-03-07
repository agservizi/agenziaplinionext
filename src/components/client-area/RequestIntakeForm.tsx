"use client";

import { useState, type FormEvent } from "react";
import type { ClientAreaConfig } from "@/lib/client-area";

type RequestIntakeFormProps = {
  area: ClientAreaConfig;
};

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  notes: string;
  details: Record<string, string>;
};

function buildInitialState(area: ClientAreaConfig): FormState {
  return {
    customerName: "",
    email: "",
    phone: "",
    serviceType: area.serviceOptions[0]?.value ?? "",
    notes: "",
    details: Object.fromEntries(area.fields.map((field) => [field.id, ""])),
  };
}

export default function RequestIntakeForm({ area }: RequestIntakeFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(area));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/client-area/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: area.key,
          serviceType: form.serviceType,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          details: form.details,
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Impossibile inviare la richiesta.");
      }

      setStatus("success");
      setMessage(payload.message || "Richiesta inviata.");
      setForm(buildInitialState(area));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Errore invio richiesta.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
          Nuova richiesta
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Apri la tua pratica</h2>
        <p className="text-sm text-slate-600">
          Compila i campi principali: il team ti ricontatta per conferma, documenti e passaggi operativi.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Nome e cognome</span>
          <input
            value={form.customerName}
            onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            placeholder="Inserisci il nominativo"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            placeholder="nome@dominio.it"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Telefono</span>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            placeholder="Numero di contatto"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Servizio</span>
          <select
            value={form.serviceType}
            onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          >
            {area.serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {area.fields.map((field) => (
          <label key={field.id} className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">{field.label}</span>
            <input
              type={field.type ?? "text"}
              value={form.details[field.id] ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  details: { ...current.details, [field.id]: event.target.value },
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              placeholder={field.placeholder}
              required={field.required}
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block space-y-2">
        <span className="block text-sm font-medium text-slate-700">Note operative</span>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          rows={5}
          placeholder="Inserisci dettagli utili, urgenze o richieste particolari"
        />
      </label>

      {message ? (
        <p
          className={
            status === "success"
              ? "mt-4 text-sm font-medium text-emerald-600"
              : "mt-4 text-sm font-medium text-red-600"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Invio in corso..." : "Invia richiesta"}
      </button>
    </form>
  );
}
