"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactForm({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const isDark = tone === "dark";
  const inputClass = isDark
    ? "w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
    : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Invio non riuscito");
      }

      setState("success");
      event.currentTarget.reset();
      setMessage("Messaggio inviato con successo. Ti risponderemo al più presto.");

      if (typeof window !== "undefined") {
        const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
        gtag?.("event", "richiesta_servizio", {
          event_category: "contatti",
          event_label: String(payload.service ?? ""),
        });
      }
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Si è verificato un errore. Riprova più tardi.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={isDark ? "space-y-2 text-sm text-slate-200" : "space-y-2 text-sm text-slate-700"}>
          Nome e cognome
          <input
            name="name"
            required
            className={inputClass}
          />
        </label>
        <label className={isDark ? "space-y-2 text-sm text-slate-200" : "space-y-2 text-sm text-slate-700"}>
          Email
          <input
            type="email"
            name="email"
            required
            className={inputClass}
          />
        </label>
      </div>
      <label className={isDark ? "space-y-2 text-sm text-slate-200" : "space-y-2 text-sm text-slate-700"}>
        Servizio di interesse
        <select name="service" className={inputClass}>
          <option value="">Seleziona un servizio</option>
          <option>Bollettini (123 – 451 – 674 – 896)</option>
          <option>Bonifici bancari</option>
          <option>F24</option>
          <option>PagoPA</option>
          <option>Tassa di possesso</option>
          <option>Iliad Space</option>
          <option>WindTre</option>
          <option>Fastweb</option>
          <option>Very Mobile</option>
          <option>Ho. Mobile</option>
          <option>Digi Mobile</option>
          <option>Enel Energia</option>
          <option>A2A Energia</option>
          <option>WindTre Luce e Gas</option>
          <option>Fastweb Energia</option>
          <option>Egea | Iren</option>
          <option>Spedizioni nazionali</option>
          <option>Spedizioni internazionali</option>
          <option>SPID</option>
          <option>PEC</option>
          <option>Firma Digitale</option>
          <option>Posta Telematica</option>
          <option>Invio PEC</option>
          <option>Invio Email</option>
          <option>Realizzazione siti web</option>
          <option>Gestionali su misura</option>
        </select>
      </label>
      <label className={isDark ? "space-y-2 text-sm text-slate-200" : "space-y-2 text-sm text-slate-700"}>
        Messaggio
        <textarea
          name="message"
          required
          rows={5}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className={
          isDark
            ? "w-full rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/70"
            : "w-full rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-600/70"
        }
      >
        {state === "loading" ? "Invio in corso..." : "Invia richiesta"}
      </button>
      {message ? (
        <p
          className={
            state === "success" ? "text-sm text-emerald-300" : "text-sm text-rose-300"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
