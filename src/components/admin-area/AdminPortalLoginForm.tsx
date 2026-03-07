"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAdminPortalToken,
  loginAdminPortal,
  validateAdminPortalSession,
} from "@/lib/admin-portal-auth";

export default function AdminPortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/area-admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const token = getAdminPortalToken();
      if (!token) return;
      const valid = await validateAdminPortalSession(token);
      if (active && valid) {
        router.replace(nextPath);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [nextPath, router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await loginAdminPortal(username, password);
      router.replace(nextPath);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Non sono entrato nel pannello");
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-4xl p-8">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Controllo interno
        </p>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Nome utente</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="Scrivo il nome utente admin"
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="Scrivo la password admin"
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        {message ? <p className="text-sm font-medium text-red-400">{message}</p> : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/25 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Verifico le credenziali..." : "Entro nel pannello"}
        </button>
      </div>
    </form>
  );
}
