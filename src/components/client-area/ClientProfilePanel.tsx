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

function buildInitials(value: string) {
  const parts = value
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "CL";
  return parts.map((item) => item.charAt(0).toUpperCase()).join("");
}

function sanitizeProfileFields(profile: ClientPortalProfile | null) {
  return {
    fullName: profile?.fullName || "",
    email: profile?.email || profile?.username || "",
    phone: profile?.phone || "",
    companyName: profile?.companyName || "",
  };
}

export default function ClientProfilePanel() {
  const [profileMeta, setProfileMeta] = useState<{
    username: string;
    userId: number | null;
    source: string;
  } | null>(null);
  const [profile, setProfile] = useState<ClientPortalProfile | null>(null);
  const [editable, setEditable] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [profileMessage, setProfileMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
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
      setProfileMessage("Sessione cliente non trovata.");
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
        setProfileMessage(error instanceof Error ? error.message : "Non riesco a leggere il profilo.");
      });

    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async () => {
    const token = getClientPortalToken();
    if (!token) {
      setProfileMessage("Sessione cliente non trovata.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setProfileMessage("");

    try {
      const result = await updateClientPortalProfile({
        token,
        fullName,
        email,
        phone,
        companyName,
      });

      setProfile(result.profile);
      setProfileMeta(readClientPortalTokenPayload());
      setStatus("ready");
      setProfileMessage(result.message);
    } catch (error) {
      setStatus("error");
      setProfileMessage(error instanceof Error ? error.message : "Aggiornamento profilo non riuscito.");
    }
  };

  const savePassword = async () => {
    const token = getClientPortalToken();
    if (!token) {
      setSecurityMessage("Sessione cliente non trovata.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setSecurityMessage("");

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
      setSecurityMessage(result.message);
    } catch (error) {
      setStatus("error");
      setSecurityMessage(error instanceof Error ? error.message : "Aggiornamento password non riuscito.");
    }
  };

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editable) {
      setProfileMessage("Questo accesso non puo essere modificato da qui.");
      return;
    }

    await saveProfile();
  };

  const onSecuritySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editable) {
      setSecurityMessage("Questo accesso non puo essere modificato da qui.");
      return;
    }

    if (!newPassword) {
      setSecurityMessage("Inserisci una nuova password per procedere.");
      setStatus("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage("La nuova password e la conferma non coincidono.");
      setStatus("error");
      return;
    }

    if (!currentPassword) {
      setSecurityMessage("Inserisci la password attuale per cambiarla.");
      setStatus("error");
      return;
    }

    await savePassword();
  };

  const displayName = profileMeta?.username || profile?.username || "Utente cliente";
  const profileFields = sanitizeProfileFields(profile);
  const profileDirty =
    fullName !== profileFields.fullName ||
    email !== profileFields.email ||
    phone !== profileFields.phone ||
    companyName !== profileFields.companyName;
  const passwordDirty =
    currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
  const profileInitials = buildInitials(fullName || profile?.fullName || displayName);
  const loginSource =
    profileMeta?.source === "db" || profile?.source === "db"
      ? "Account registrato su database"
      : profileMeta?.source === "env" || profile?.source === "env"
        ? "Accesso di fallback configurato"
        : "Sessione cliente attiva";
  const accountModeLabel = editable ? "Profilo modificabile" : "Consultazione sola lettura";
  const accountModeTone = editable
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(238,246,251,0.96))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.3fr_0.7fr] md:px-8">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
              Area clienti / Profilo
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Impostazioni account e dati cliente
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Una pagina unica per gestire identita account, contatti principali e credenziali di
                accesso, con uno stato chiaro su cosa puoi modificare subito.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${accountModeTone}`}
              >
                {accountModeLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600">
                {loginSource}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Accesso
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-slate-950">{displayName}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cliente
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {profileMeta?.userId ? `Cliente #${profileMeta.userId}` : "Profilo non numerato"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Operativita
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {editable
                  ? "Aggiornamento dati e password disponibile"
                  : "Riepilogo visibile, modifica bloccata"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                {profileInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-950">
                  {fullName || profile?.fullName || "Profilo cliente"}
                </p>
                <p className="truncate text-sm text-slate-500">{email || displayName}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Telefono
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{phone || "Non impostato"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Azienda
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {companyName || "Privato / non indicata"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/area-clienti"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Torna alla dashboard clienti
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-950">Stato account</p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Origine accesso
                </p>
                <p className="mt-1">{loginSource}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Permessi
                </p>
                <p className="mt-1">
                  {editable
                    ? "Puoi aggiornare anagrafica e password direttamente da questa pagina."
                    : "Il profilo arriva da configurazione fallback: i dati sono consultabili ma non modificabili."}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {status === "loading" ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              Sto caricando i dati del profilo...
            </div>
          ) : null}

          {status === "error" && !profile ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              {profileMessage || "Non riesco a leggere il profilo."}
            </div>
          ) : null}

          {status !== "loading" && profile ? (
            <>
              <form
                onSubmit={onProfileSubmit}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                      Informazioni profilo
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      Dati anagrafici e contatti
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Aggiorna i riferimenti principali usati nei moduli dell&apos;area clienti e
                      nelle comunicazioni operative.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {profileDirty ? "Modifiche non salvate" : "Dati sincronizzati"}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Nome e cognome
                    </span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Nome mostrato nei riepiloghi e nelle richieste inviate.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Usata per accesso, notifiche e conferme operative.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Telefono</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Numero richiamabile dal team per pratiche e supporto.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Azienda</span>
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Facoltativo, utile per richieste business e documenti intestati.
                    </span>
                  </label>
                </div>

                {profileMessage ? (
                  <div
                    className={`mt-6 rounded-3xl border px-5 py-4 text-sm ${
                      status === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {profileMessage}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    {editable
                      ? "Salva solo quando hai terminato di aggiornare i dati principali."
                      : "Questo profilo e in sola lettura."}
                  </p>
                  <button
                    type="submit"
                    disabled={!editable || status === "saving" || !profileDirty}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {status === "saving" ? "Sto salvando..." : "Salva dati profilo"}
                  </button>
                </div>
              </form>

              <form
                onSubmit={onSecuritySubmit}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                      Sicurezza
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      Cambio password
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Mantieni separata la parte sensibile dell&apos;account: aggiorna la password
                      solo quando necessario.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {passwordDirty ? "Bozza password presente" : "Nessuna modifica in corso"}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Password attuale
                    </span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Serve per confermare che sei il titolare dell&apos;accesso.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Nuova password
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Usa una password diversa da quelle gia usate altrove.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Conferma nuova password
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={!editable}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <span className="mt-2 block text-xs text-slate-500">
                      Ripeti la nuova password per evitare errori di digitazione.
                    </span>
                  </label>
                </div>

                {!editable ? (
                  <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                    Questo accesso deriva dal fallback configurato in ambiente: la password non
                    puo essere aggiornata da qui.
                  </div>
                ) : null}

                {securityMessage ? (
                  <div
                    className={`mt-6 rounded-3xl border px-5 py-4 text-sm ${
                      status === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {securityMessage}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    La modifica password e indipendente dai dati anagrafici e viene salvata
                    separatamente.
                  </p>
                  <button
                    type="submit"
                    disabled={!editable || status === "saving" || !passwordDirty}
                    className="inline-flex items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {status === "saving" ? "Sto aggiornando..." : "Aggiorna password"}
                  </button>
                </div>
              </form>
            </>
          ) : null}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-950">Link rapidi</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link
                href="/area-clienti/spedizioni"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Vai a spedizioni
              </Link>
              <Link
                href="/area-clienti/visure"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Vai a visure
              </Link>
              <Link
                href="/area-clienti/ticket-pratiche-documenti"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Apri ticket pratiche
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
