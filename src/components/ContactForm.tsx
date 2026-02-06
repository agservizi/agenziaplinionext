"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

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
        <label className="space-y-2 text-sm text-slate-200">
          Nome e cognome
          <input
            name="name"
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Email
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
      </div>
      <label className="space-y-2 text-sm text-slate-200">
        Servizio di interesse
        <input
          name="service"
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
      </label>
      <label className="space-y-2 text-sm text-slate-200">
        Messaggio
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/70"
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
