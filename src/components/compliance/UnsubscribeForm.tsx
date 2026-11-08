"use client";

import { useState } from "react";

type Props = {
  initialToken?: string;
  initialOk?: boolean;
  initialError?: boolean;
};

export default function UnsubscribeForm({
  initialToken = "",
  initialOk = false,
  initialError = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    initialOk ? "ok" : initialError ? "error" : "idle",
  );
  const [message, setMessage] = useState(
    initialOk
      ? "Disiscrizione completata."
      : initialError
        ? "Link non valido. Inserisci la tua email."
        : "",
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/marketing/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, e: initialToken }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message || "Operazione non riuscita");
      setStatus("ok");
      setMessage(data.message || "Disiscrizione completata.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Operazione non riuscita");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-[var(--ink)]/10 bg-white p-6">
      <label className="block text-sm text-[var(--ink)]/80">
        Email da disiscrivere
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#5E0ED7]/40 focus:ring-2 focus:ring-[#5E0ED7]/10"
          placeholder="nome@email.it"
          autoComplete="email"
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="brutal-cta-ink inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5E0ED7] disabled:opacity-60"
      >
        {status === "loading" ? "Invio..." : "Conferma disiscrizione"}
      </button>
      {message ? (
        <p className={`text-sm ${status === "ok" ? "text-emerald-700" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
