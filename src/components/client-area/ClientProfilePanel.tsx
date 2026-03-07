"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  fetchClientPortalProfile,
  getClientPortalToken,
  readClientPortalTokenPayload,
  updateClientPortalProfile,
  type ClientPortalProfile,
} from "@/lib/client-portal-auth";

export default function ClientProfilePanel() {
  const [profileMeta, setProfileMeta] = useState<{
    username: string;
    userId: number | null;
    source: string;
  } | null>(null);
  const [profile, setProfile] = useState<ClientPortalProfile | null>(null);
  const [editable, setEditable] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;

    const token = getClientPortalToken();
    setProfileMeta(readClientPortalTokenPayload());

    if (!token) {
      setStatus("error");
      setMessage("Sessione cliente non trovata.");
      return () => {
        active = false;
      };
    }

    fetchClientPortalProfile(token)
      .then(({ editable: canEdit, profile: nextProfile }) => {
        if (!active) return;
        setProfile(nextProfile);
        setEditable(canEdit);
        setFullName(nextProfile.fullName || "");
        setEmail(nextProfile.email || nextProfile.username || "");
        setPhone(nextProfile.phone || "");
        setCompanyName(nextProfile.companyName || "");
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Non riesco a leggere il profilo.");
      });

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editable) {
      setMessage("Questo accesso non puo essere modificato da qui.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage("La nuova password e la conferma non coincidono.");
      setStatus("error");
      return;
    }

    if (newPassword && !currentPassword) {
      setMessage("Inserisci la password attuale per cambiarla.");
      setStatus("error");
      return;
    }

    const token = getClientPortalToken();
    if (!token) {
      setMessage("Sessione cliente non trovata.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      const result = await updateClientPortalProfile({
        token,
        fullName,
        email,
        phone,
        companyName,
        currentPassword,
        newPassword,
      });

      setProfile(result.profile);
      setProfileMeta(readClientPortalTokenPayload());
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("ready");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Aggiornamento profilo non riuscito.");
    }
  };

  const displayName = profileMeta?.username || profile?.username || "Utente cliente";
  const loginSource =
    profileMeta?.source === "db" || profile?.source === "db"
      ? "Account registrato su database"
      : profileMeta?.source === "env" || profile?.source === "env"
        ? "Accesso di fallback configurato"
        : "Sessione cliente attiva";

  return (
    <div className="glass-card rounded-4xl p-8">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Profilo</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Gestisci i tuoi dati area clienti
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Qui puoi vedere chi sta usando l&apos;account e, se il profilo e registrato nel database,
            aggiornare i dati e cambiare la password.
          </p>
          <div className="mt-5">
            <Link
              href="/area-clienti"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Torna all&apos;area clienti
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Accesso</p>
            <p className="mt-3 break-all text-base font-semibold text-white">{displayName}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Origine</p>
            <p className="mt-3 text-sm font-medium text-slate-200">{loginSource}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Identificativo</p>
            <p className="mt-3 text-sm font-medium text-slate-200">
              {profileMeta?.userId ? `Cliente #${profileMeta.userId}` : "Profilo non numerato"}
            </p>
          </div>
        </div>

        {status === "loading" ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-300">
            Sto caricando i dati del profilo...
          </div>
        ) : null}

        {status !== "loading" ? (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Nome e cognome</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={!editable}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={!editable}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Telefono</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={!editable}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Azienda</span>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  disabled={!editable}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
              <p className="text-sm font-semibold text-white">Cambio password</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Compila questi campi solo se vuoi aggiornare la password del tuo accesso.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Password attuale</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    disabled={!editable}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Nuova password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={!editable}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Conferma nuova password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={!editable}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
            </div>

            {message ? (
              <div
                className={`rounded-3xl border px-5 py-4 text-sm ${
                  status === "error"
                    ? "border-red-400/30 bg-red-500/10 text-red-100"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {message}
              </div>
            ) : null}

            {editable ? (
              <button
                type="submit"
                disabled={status === "saving"}
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "saving" ? "Sto aggiornando il profilo..." : "Salva modifiche"}
              </button>
            ) : (
              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                <p className="text-sm font-medium text-cyan-100">
                  Questo accesso nasce dal fallback configurato in ambiente: da qui puoi solo consultare il riepilogo, non modificare i dati.
                </p>
              </div>
            )}
          </form>
        ) : null}
      </div>
    </div>
  );
}
