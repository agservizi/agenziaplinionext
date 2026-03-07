"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getClientPortalToken,
  loginClientPortal,
  submitClientPortalRegistrationRequest,
  validateClientPortalSession,
} from "@/lib/client-portal-auth";

export default function ClientPortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/area-clienti";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const token = getClientPortalToken();
      if (!token) return;
      const valid = await validateClientPortalSession(token);
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
      if (mode === "login") {
        await loginClientPortal(username, password);
        router.replace(nextPath);
        return;
      }

      if (registerPassword !== confirmPassword) {
        throw new Error("Le password non coincidono");
      }

      const resultMessage = await submitClientPortalRegistrationRequest({
        fullName,
        email,
        password: registerPassword,
      });
      setStatus("idle");
      setMessage(resultMessage);
      setFullName("");
      setEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setMode("login");
      setUsername(email);
      setPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : mode === "login"
            ? "Non sono riuscito a farti entrare"
            : "Non sono riuscito a inviare la tua richiesta",
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-4xl p-8">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-slate-950/60 p-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
              setStatus("idle");
            }}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-950/25"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Accesso
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
              setStatus("idle");
            }}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-950/25"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Registrati
          </button>
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          {mode === "login" ? "Accesso riservato" : "Nuovo cliente"}
        </p>

        {mode === "login" ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Email o nome utente</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="Scrivi la tua email o il tuo nome utente"
                autoComplete="username"
                required={mode === "login"}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="Scrivi la tua password"
                autoComplete="current-password"
                required={mode === "login"}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Nome e cognome</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="Come ti chiami"
                autoComplete="name"
                required={mode === "register"}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="nome@dominio.it"
                autoComplete="email"
                required={mode === "register"}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
              <input
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="Scegli una password"
                autoComplete="new-password"
                required={mode === "register"}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Conferma password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="Ripeti la password"
                autoComplete="new-password"
                required={mode === "register"}
              />
            </label>
          </div>
        )}

        {message ? (
          <p
            className={`text-sm font-medium ${
              status === "error" ? "text-red-400" : "text-emerald-300"
            }`}
          >
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/25 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading"
            ? mode === "login"
              ? "Controllo i dati..."
              : "Creo il tuo accesso..."
            : mode === "login"
              ? "Entra nella tua area"
              : "Crea il tuo accesso"}
        </button>
        {mode === "register" ? (
          <p className="text-xs leading-6 text-slate-400">
            Il tuo account si attiva subito: appena completi la registrazione puoi entrare con la
            tua email e la password che hai scelto.
          </p>
        ) : null}
      </div>
    </form>
  );
}
