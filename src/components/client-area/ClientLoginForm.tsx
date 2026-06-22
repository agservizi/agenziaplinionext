"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginClientPortal } from "@/lib/client-portal-auth";
import { motion, AnimatePresence } from "framer-motion";
import { submitClientPortalRegistrationRequest } from "@/lib/client-portal-auth";

type Tab = "login" | "register";

export default function ClientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/area-clienti";
  const callbackUrl = rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//") ? rawCallbackUrl : "/area-clienti";
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Inserisci username e password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loginClientPortal(username.trim(), password);
      router.push(callbackUrl);
    } catch {
      setError("Credenziali non valide. Verifica username e password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !regEmail || !regPassword) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }

    if (regPassword !== regConfirm) {
      setError("Le password non coincidono.");
      return;
    }

    if (regPassword.length < 8) {
      setError("La password deve essere di almeno 8 caratteri.");
      return;
    }

    setLoading(true);
    try {
      await submitClientPortalRegistrationRequest({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      await loginClientPortal(regEmail.trim(), regPassword);
      router.push(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrazione non riuscita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Tabs */}
      <div className="flex rounded-2xl border border-white/8 bg-white/4 p-1">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t === "login" ? "Accedi" : "Registrati"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "login" ? (
          <motion.form
            key="login"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">
                Username o email
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                placeholder="es. mario.rossi"
                className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Accesso in corso...
                </>
              ) : (
                "Entra nell'area clienti"
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="register"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">
                Nome e cognome
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                placeholder="Mario Rossi"
                className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Email</span>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={loading}
                placeholder="mario@esempio.it"
                className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Password</span>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={loading}
                  placeholder="min. 8 caratteri"
                  className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Conferma</span>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  disabled={loading}
                  placeholder="ripeti password"
                  className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50"
                />
              </label>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Invio in corso...
                </>
              ) : (
                "Invia richiesta di accesso"
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              La registrazione è soggetta ad approvazione. Riceverai le credenziali via email entro
              24 ore lavorative.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
