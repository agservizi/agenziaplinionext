"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginClientPortal, submitClientPortalRegistrationRequest } from "@/lib/client-portal-auth";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "login" | "register" | "forgot" | "reset";

const inputCls =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7] disabled:opacity-50";

const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45";

const primaryBtn =
  "brutal-cta-ink w-full bg-[var(--ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

const alertError =
  "border border-red-700/25 bg-red-50 px-4 py-3 text-sm text-red-900";

const alertSuccess =
  "border border-emerald-700/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-900";

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
  const [regAgeConfirmed, setRegAgeConfirmed] = useState(false);
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
    if (!regAgeConfirmed) {
      setError("Per registrarti devi dichiarare di avere almeno 14 anni.");
      return;
    }
    setLoading(true);
    try {
      await submitClientPortalRegistrationRequest({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        ageConfirmed: true,
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
        <div className="grid grid-cols-2 gap-px border border-[var(--ink)]/15 bg-[var(--ink)]/15">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError("");
                setSuccess("");
              }}
              className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                tab === t
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--paper)] text-[var(--ink)]/45 hover:text-[#5E0ED7]"
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
              <span className={labelCls}>Username o email</span>
              <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
            </label>
            <label className="block">
              <span className={labelCls}>Password</span>
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </label>
            {error ? <p className={alertError}>{error}</p> : null}
            {success ? <p className={alertSuccess}>{success}</p> : null}
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Accesso…" : "Entra nell'area clienti"}
            </button>
            <button
              type="button"
              className="w-full text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink)]/40 transition hover:text-[#5E0ED7]"
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
              <span className={labelCls}>Nome e cognome</span>
              <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
            </label>
            <label className="block">
              <span className={labelCls}>Email</span>
              <input type="email" className={inputCls} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={loading} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelCls}>Password</span>
                <input type="password" className={inputCls} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} disabled={loading} />
              </label>
              <label className="block">
                <span className={labelCls}>Conferma</span>
                <input type="password" className={inputCls} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} disabled={loading} />
              </label>
            </div>
            <label className="flex items-start gap-2 text-[11px] leading-snug text-[var(--ink)]/55">
              <input
                type="checkbox"
                checked={regAgeConfirmed}
                onChange={(e) => setRegAgeConfirmed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 appearance-none border border-[var(--ink)]/25 bg-[var(--paper)] accent-[#5E0ED7] checked:border-[var(--ink)] checked:bg-[var(--ink)]"
                required
              />
              <span>
                Dichiaro di avere almeno 14 anni. Se ho meno di 14 anni, un genitore o tutore deve prestare il consenso al trattamento dei dati.
              </span>
            </label>
            {error ? <p className={alertError}>{error}</p> : null}
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Invio…" : "Invia richiesta di accesso"}
            </button>
          </motion.form>
        ) : null}

        {tab === "forgot" ? (
          <motion.form key="forgot" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--ink)]/55">
              Inserisci l&apos;email dell&apos;account. Ti mandiamo un link di reset.
            </p>
            <label className="block">
              <span className={labelCls}>Email</span>
              <input type="email" className={inputCls} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} disabled={loading} />
            </label>
            {error ? <p className={alertError}>{error}</p> : null}
            {success ? <p className={alertSuccess}>{success}</p> : null}
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Invio…" : "Invia link reset"}
            </button>
            <button
              type="button"
              className="w-full text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink)]/40 transition hover:text-[#5E0ED7]"
              onClick={() => setTab("login")}
            >
              Torna al login
            </button>
          </motion.form>
        ) : null}

        {tab === "reset" ? (
          <motion.form key="reset" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleReset} className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--ink)]/55">
              Scegli una nuova password per il tuo account.
            </p>
            <label className="block">
              <span className={labelCls}>Nuova password</span>
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
            </label>
            <label className="block">
              <span className={labelCls}>Conferma</span>
              <input type="password" className={inputCls} value={newConfirm} onChange={(e) => setNewConfirm(e.target.value)} disabled={loading} />
            </label>
            {error ? <p className={alertError}>{error}</p> : null}
            <button type="submit" disabled={loading || !resetToken} className={primaryBtn}>
              {loading ? "Salvataggio…" : "Aggiorna password"}
            </button>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
