"use client";

import { useState } from "react";

export default function ContentReportForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/public/content-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: form.get("reporterName"),
          reporterEmail: form.get("reporterEmail"),
          contentUrl: form.get("contentUrl"),
          category: form.get("category"),
          description: form.get("description"),
          goodFaith: form.get("goodFaith") === "on",
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message || "Invio non riuscito");
      setStatus("ok");
      setMessage(data.message || "Segnalazione inviata. Grazie.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Invio non riuscito");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 space-y-4 rounded-2xl border border-[var(--ink)]/10 bg-white p-6"
    >
      <label className="block text-sm text-[var(--ink)]/80">
        Nome e cognome
        <input
          name="reporterName"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#5E0ED7]/40"
        />
      </label>
      <label className="block text-sm text-[var(--ink)]/80">
        Email di contatto
        <input
          name="reporterEmail"
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#5E0ED7]/40"
        />
      </label>
      <label className="block text-sm text-[var(--ink)]/80">
        URL o riferimento del contenuto
        <input
          name="contentUrl"
          required
          placeholder="https://… oppure codice pratica / descrizione posizione"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#5E0ED7]/40"
        />
      </label>
      <label className="block text-sm text-[var(--ink)]/80">
        Tipo di violazione
        <select
          name="category"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#5E0ED7]/40"
          defaultValue=""
        >
          <option value="" disabled>
            Seleziona
          </option>
          <option>Diritti d&apos;autore / marchi</option>
          <option>Diffamazione o odio</option>
          <option>Privacy / dati personali</option>
          <option>Frode o truffa</option>
          <option>Altro illecito</option>
        </select>
      </label>
      <label className="block text-sm text-[var(--ink)]/80">
        Descrizione
        <textarea
          name="description"
          required
          rows={5}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#5E0ED7]/40"
          placeholder="Spiega perché il contenuto è illecito e dove si trova."
        />
      </label>
      <label className="flex items-start gap-2 text-xs text-[var(--ink)]/65">
        <input name="goodFaith" type="checkbox" required className="mt-0.5 h-3.5 w-3.5" />
        <span>
          Dichiaro in buona fede che le informazioni fornite sono accurate e complete.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="brutal-cta-ink inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5E0ED7] disabled:opacity-60"
      >
        {status === "loading" ? "Invio..." : "Invia segnalazione"}
      </button>
      {message ? (
        <p className={`text-sm ${status === "ok" ? "text-emerald-700" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
