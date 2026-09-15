"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginClientPortal, submitClientPortalRegistrationRequest } from "@/lib/client-portal-auth";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "login" | "register" | "forgot" | "reset";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:bg-white/8 disabled:opacity-50";

export default function ClientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/area-clienti";
  const callbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/area-clienti";
  const resetToken = searchParams.get("reset") || "";
  const initialTab: Tab =
    resetToken
      ? "reset"
      : searchParams.get("tab") === "register"
        ? "register"
        : searchParams.get("tab") === "forgot"
          ? "forgot"
          : "login";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirm, setNewConfirm] = useState("");

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
      setSuccess("Richiesta inviata. Ti avviseremo dopo l'approvazione.");
      setTab("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrazione non riuscita.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!forgotEmail) {
      setError("Inserisci l'email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/client-auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      setSuccess(data.message || "Se l'email è registrata, riceverai le istruzioni.");
    } catch {
      setError("Operazione non riuscita.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (newPassword !== newConfirm) {
      setError("Le password non coincidono.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/client-auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset non riuscito");
      setSuccess(data.message || "Password aggiornata.");
      setTab("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset non riuscito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {tab === "login" || tab === "register" ? (
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
                tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t === "login" ? "Accedi" : "Registrati"}
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {tab === "login" ? (
          <motion.form
            key="login"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Username o email</span>
              <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Password</span>
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </label>
            {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            {success ? <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p> : null}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Accesso…" : "Entra nell'area clienti"}
            </button>
            <button
              type="button"
              className="w-full text-center text-xs text-white/40 hover:text-white/70"
              onClick={() => {
                setTab("forgot");
                setError("");
                setSuccess("");
              }}
            >
              Password dimenticata?
            </button>
          </motion.form>
        ) : null}

        {tab === "register" ? (
          <motion.form key="register" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={handleRegister} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Nome e cognome</span>
              <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Email</span>
              <input type="email" className={inputCls} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={loading} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Password</span>
                <input type="password" className={inputCls} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} disabled={loading} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Conferma</span>
                <input type="password" className={inputCls} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} disabled={loading} />
              </label>
            </div>
            {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Invio…" : "Invia richiesta di accesso"}
            </button>
          </motion.form>
        ) : null}

        {tab === "forgot" ? (
          <motion.form key="forgot" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-white/50">Inserisci l&apos;email dell&apos;account. Ti mandiamo un link di reset.</p>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Email</span>
              <input type="email" className={inputCls} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} disabled={loading} />
            </label>
            {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            {success ? <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Invio…" : "Invia link reset"}
            </button>
            <button type="button" className="w-full text-xs text-white/40" onClick={() => setTab("login")}>
              Torna al login
            </button>
          </motion.form>
        ) : null}

        {tab === "reset" ? (
          <motion.form key="reset" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-white/50">Scegli una nuova password per il tuo account.</p>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Nuova password</span>
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Conferma</span>
              <input type="password" className={inputCls} value={newConfirm} onChange={(e) => setNewConfirm(e.target.value)} disabled={loading} />
            </label>
            {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            <button type="submit" disabled={loading || !resetToken} className="w-full rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Salvataggio…" : "Aggiorna password"}
            </button>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
