"use client";

/**
 * Callers: Contatti + /lascia-un-feedback. API: POST /api/contatti.
 * User: convert feedback form to brutal editorial + deploy.
 */
import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

type ContactFormProps = {
  tone?: "light" | "dark";
  initialService?: string;
  initialMessage?: string;
  submitLabel?: string;
};

const lightInput =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";
const darkInput =
  "w-full border border-white/15 bg-slate-950/40 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400";
const lightLabel =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45";
const darkLabel =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45";
const lightButton =
  "brutal-cta-ink w-full bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";
const darkButton =
  "brutal-cta-ink w-full bg-cyan-500 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60";

export default function ContactForm({
  tone = "dark",
  initialService = "",
  initialMessage = "",
  submitLabel = "Invia richiesta",
}: ContactFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const isDark = tone === "dark";
  const inputClass = isDark ? darkInput : lightInput;
  const labelClass = isDark ? darkLabel : lightLabel;

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Nome e cognome</span>
          <input name="name" required className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Email</span>
          <input type="email" name="email" required className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Servizio di interesse</span>
        <select name="service" className={inputClass} defaultValue={initialService}>
          <option value="">Seleziona un servizio</option>
          <option>Feedback privato</option>
          <option>Bollettini (123 – 451 – 674 – 896)</option>
          <option>Bonifici bancari</option>
          <option>F24</option>
          <option>PagoPA</option>
          <option>Tassa di possesso</option>
          <option>Versamento passaporto</option>
          <option>Iliad Space</option>
          <option>Fastweb</option>
          <option>Ho. Mobile</option>
          <option>Digi Mobile</option>
          <option>Enel Energia</option>
          <option>A2A Energia</option>
          <option>Fastweb Energia</option>
          <option>Plenitude</option>
          <option>Sentra Energia</option>
          <option>Altri operatori energia</option>
          <option>Spedizioni nazionali</option>
          <option>Spedizioni internazionali</option>
          <option>Deposito bagagli</option>
          <option>Fermo deposito pacchi</option>
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
      <label className="block">
        <span className={labelClass}>Messaggio</span>
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={initialMessage}
          className={`${inputClass} min-h-28 resize-y`}
        />
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className={isDark ? darkButton : lightButton}
      >
        {state === "loading" ? "Invio in corso..." : submitLabel}
      </button>
      {message ? (
        <p
          role="alert"
          className={
            state === "success"
              ? isDark
                ? "border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                : "border border-emerald-700/25 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              : isDark
                ? "border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
                : "border border-red-700/25 bg-red-50 px-3 py-2 text-sm text-red-900"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
