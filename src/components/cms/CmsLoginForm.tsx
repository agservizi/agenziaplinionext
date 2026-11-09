"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inputCls =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7] disabled:opacity-50";

const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45";

const primaryBtn =
  "brutal-cta-ink w-full bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

const alertError = "border border-red-700/25 bg-red-50 px-4 py-3 text-sm text-red-900";

export default function CmsLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/area-admin";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/area-admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Accesso non riuscito");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Errore di rete. Riprova.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className={labelCls}>Nome utente</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputCls}
          placeholder="es. storeadmin"
          autoComplete="username"
          required
        />
      </label>
      <label className="block">
        <span className={labelCls}>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </label>
      {message ? (
        <p className={alertError} role="alert">
          {message}
        </p>
      ) : null}
      <button type="submit" disabled={status === "loading"} className={primaryBtn}>
        {status === "loading" ? "Verifica…" : "Entra nell'editor"}
      </button>
    </form>
  );
}
