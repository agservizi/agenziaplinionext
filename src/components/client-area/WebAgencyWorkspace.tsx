"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ClientAreaConfig } from "@/lib/client-area";
import { fetchClientPortalProfile, getClientPortalToken } from "@/lib/client-portal-auth";

type Props = {
  area: ClientAreaConfig;
};

type FormState = {
  projectType: string;
  customerName: string;
  email: string;
  phone: string;
  projectGoal: string;
  budgetRange: string;
  timeline: string;
  businessSector: string;
  existingSiteUrl: string;
  contactPreference: string;
  materialsReady: string;
  newSite: boolean;
  hasExistingSite: boolean;
  needsBranding: boolean;
  needsSeo: boolean;
  needsAdvertising: boolean;
  notes: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
};

function buildInitialState(area: ClientAreaConfig): FormState {
  return {
    projectType: area.serviceOptions[0]?.value || "sito-vetrina",
    customerName: "",
    email: "",
    phone: "",
    projectGoal: "",
    budgetRange: "<1500",
    timeline: "valutazione",
    businessSector: "",
    existingSiteUrl: "",
    contactPreference: "indifferente",
    materialsReady: "nessuno",
    newSite: false,
    hasExistingSite: false,
    needsBranding: false,
    needsSeo: false,
    needsAdvertising: false,
    notes: "",
    privacyConsent: false,
    marketingConsent: false,
  };
}

function projectTypeLabel(value: string) {
  switch (value) {
    case "sito-vetrina":
      return "Sito vetrina";
    case "ecommerce":
      return "E-commerce";
    case "seo-local":
      return "SEO locale";
    case "gestionale":
      return "Gestionale";
    case "landing-page":
    case "advertising":
      return "Landing page";
    default:
      return value || "Progetto";
  }
}

export default function WebAgencyWorkspace({ area }: Props) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(area));
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [latestRequestId, setLatestRequestId] = useState<number | null>(null);
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [profileDefaults, setProfileDefaults] = useState<Pick<FormState, "customerName" | "email" | "phone">>({
    customerName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    let active = true;
    const token = getClientPortalToken();
    if (!token) {
      return () => {
        active = false;
      };
    }

    setProfileStatus("loading");
    fetchClientPortalProfile(token)
      .then(({ profile }) => {
        if (!active) return;
        const defaults = {
          customerName: profile.fullName || "",
          email: profile.email || profile.username || "",
          phone: profile.phone || "",
        };
        setProfileDefaults(defaults);
        setForm((current) => ({
          ...current,
          customerName: current.customerName || defaults.customerName,
          email: current.email || defaults.email,
          phone: current.phone || defaults.phone,
        }));
        setProfileStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setProfileStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const projectConfig = useMemo(() => {
    switch (form.projectType) {
      case "ecommerce":
        return {
          goalLabel: "Obiettivo e-commerce",
          goalPlaceholder: "Es. vendere online, integrare pagamenti, migliorare conversioni",
          sectorPlaceholder: "Es. moda, food, ricambi, cosmetica",
          siteLabel: "Shop o sito attuale",
          sitePlaceholder: "https://shop-esistente.it",
          notesPlaceholder: "Es. numero prodotti, metodi pagamento, corriere, marketplace già usati",
          showSiteChoice: true,
          showMaterialsReady: true,
          showBranding: true,
          showSeo: true,
          showAdvertising: false,
        };
      case "seo-local":
        return {
          goalLabel: "Obiettivo SEO locale",
          goalPlaceholder: "Es. farmi trovare su Google Maps, aumentare chiamate e richieste",
          sectorPlaceholder: "Es. agenzia, negozio, professionista, studio medico",
          siteLabel: "Sito o scheda Google attuale",
          sitePlaceholder: "https://sito-o-scheda-attuale.it",
          notesPlaceholder: "Es. zona servita, keyword target, scheda Google già attiva",
          showSiteChoice: true,
          showMaterialsReady: false,
          showBranding: false,
          showSeo: true,
          showAdvertising: false,
        };
      case "gestionale":
        return {
          goalLabel: "Esigenza del gestionale",
          goalPlaceholder: "Es. preventivi, magazzino, clienti, appuntamenti, workflow interno",
          sectorPlaceholder: "Es. studio tecnico, agenzia, negozio, logistica",
          siteLabel: "Software o processo attuale",
          sitePlaceholder: "Es. Excel, gestionale attuale, link demo",
          notesPlaceholder: "Es. utenti previsti, reparti coinvolti, automazioni richieste, integrazioni",
          showSiteChoice: false,
          showMaterialsReady: false,
          showBranding: false,
          showSeo: false,
          showAdvertising: false,
        };
      case "landing-page":
      case "advertising":
        return {
          goalLabel: "Obiettivo landing page",
          goalPlaceholder: "Es. raccolta lead, prenotazioni, richiesta preventivo, lancio servizio",
          sectorPlaceholder: "Es. immobiliare, servizi, consulenza, local business",
          siteLabel: "Landing o pagina esistente",
          sitePlaceholder: "https://landing-o-sito.it",
          notesPlaceholder: "Es. CTA principale, offerta da spingere, target, materiali già disponibili",
          showSiteChoice: true,
          showMaterialsReady: true,
          showBranding: false,
          showSeo: false,
          showAdvertising: false,
        };
      case "sito-vetrina":
      default:
        return {
          goalLabel: "Obiettivo sito",
          goalPlaceholder: "Es. presentare servizi, ricevere contatti, rinnovare immagine",
          sectorPlaceholder: "Es. studio professionale, impresa, agenzia, ristorante",
          siteLabel: "Sito attuale",
          sitePlaceholder: "https://...",
          notesPlaceholder: "Es. pagine richieste, funzionalità utili, stile desiderato, siti di riferimento",
          showSiteChoice: true,
          showMaterialsReady: true,
          showBranding: true,
          showSeo: true,
          showAdvertising: false,
        };
    }
  }, [form.projectType]);

  const projectSummary = useMemo(() => {
    const items = [
      projectTypeLabel(form.projectType),
      form.projectGoal.trim() || "Obiettivo da definire",
      `Budget ${form.budgetRange}`,
      `Tempistiche ${form.timeline}`,
    ];
    return items.join(" · ");
  }, [form]);

  const canSubmit =
    form.projectType.trim() !== "" &&
    form.customerName.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.email.includes("@") &&
    form.budgetRange.trim() !== "" &&
    form.timeline.trim() !== "" &&
    form.privacyConsent;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setStatus("error");
      setMessage("Compila i campi obbligatori e accetta la privacy.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const token = getClientPortalToken();
      const response = await fetch("/api/client-area/web-agency/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          token,
        }),
      });

      const payload = (await response.json()) as { message?: string; requestId?: number };
      if (!response.ok) {
        throw new Error(payload.message || "Invio brief non riuscito");
      }

      setStatus("success");
      setMessage(payload.message || "Brief inviato.");
      setLatestRequestId(typeof payload.requestId === "number" ? payload.requestId : null);
      setForm({
        ...buildInitialState(area),
        ...profileDefaults,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Invio brief non riuscito");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={onSubmit} className="lux-panel rounded-3xl p-6 md:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Brief progetto</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Richiedi proposta Web Agency</h2>
          <p className="mt-2 text-sm text-slate-600">
            Raccogliamo obiettivo, budget e materiali per preparare una proposta concreta, non un contatto generico.
          </p>
          {profileStatus === "ready" ? (
            <p className="mt-3 text-xs font-medium text-emerald-700">
              Dati profilo cliente precaricati nel brief.
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tipo progetto</span>
            <select
              value={form.projectType}
              onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            >
              {area.serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Settore attività</span>
            <input
              value={form.businessSector}
              onChange={(event) => setForm((current) => ({ ...current, businessSector: event.target.value }))}
              placeholder={projectConfig.sectorPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{projectConfig.goalLabel}</span>
            <input
              value={form.projectGoal}
              onChange={(event) => setForm((current) => ({ ...current, projectGoal: event.target.value }))}
              placeholder={projectConfig.goalPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Budget</span>
            <select
              value={form.budgetRange}
              onChange={(event) => setForm((current) => ({ ...current, budgetRange: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="<1500">Sotto 1.500 EUR</option>
              <option value="1500-3000">1.500 - 3.000 EUR</option>
              <option value="3000-7000">3.000 - 7.000 EUR</option>
              <option value="7000+">Oltre 7.000 EUR</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tempistiche</span>
            <select
              value={form.timeline}
              onChange={(event) => setForm((current) => ({ ...current, timeline: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="urgente">Urgente</option>
              <option value="30-giorni">Entro 30 giorni</option>
              <option value="60-giorni">Entro 60 giorni</option>
              <option value="valutazione">Sto valutando</option>
            </select>
          </label>

          {(projectConfig.showSiteChoice || form.projectType === "gestionale") && (
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{projectConfig.siteLabel}</span>
              <input
                value={form.existingSiteUrl}
                onChange={(event) => setForm((current) => ({ ...current, existingSiteUrl: event.target.value }))}
                placeholder={projectConfig.sitePlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ...(projectConfig.showSiteChoice
              ? [
                  { key: "newSite", label: "Nuovo sito" },
                  { key: "hasExistingSite", label: "Ho già un sito" },
                ]
              : []),
            ...(projectConfig.showBranding ? [{ key: "needsBranding", label: "Mi serve branding/logo" }] : []),
            ...(projectConfig.showSeo ? [{ key: "needsSeo", label: "Mi serve SEO" }] : []),
            ...(projectConfig.showAdvertising ? [{ key: "needsAdvertising", label: "Mi serve advertising" }] : []),
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form[item.key as keyof FormState])}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setForm((current) => {
                    if (item.key === "newSite") {
                      return {
                        ...current,
                        newSite: checked,
                        hasExistingSite: checked ? false : current.hasExistingSite,
                        existingSiteUrl: checked ? "" : current.existingSiteUrl,
                      };
                    }

                    if (item.key === "hasExistingSite") {
                      return {
                        ...current,
                        hasExistingSite: checked,
                        newSite: checked ? false : current.newSite,
                      };
                    }

                    return { ...current, [item.key]: checked };
                  });
                }}
              />
              {item.label}
            </label>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {projectConfig.showMaterialsReady ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Materiali pronti</span>
              <select
                value={form.materialsReady}
                onChange={(event) => setForm((current) => ({ ...current, materialsReady: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="nessuno">Nessuno</option>
                <option value="parziali">Parziali</option>
                <option value="quasi-pronti">Quasi pronti</option>
                <option value="completi">Completi</option>
              </select>
            </label>
          ) : (
            <div className="hidden md:block" />
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Contatto preferito</span>
            <select
              value={form.contactPreference}
              onChange={(event) => setForm((current) => ({ ...current, contactPreference: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="indifferente">Indifferente</option>
              <option value="telefono">Telefono</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Nome e cognome</span>
            <input
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Telefono</span>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Note</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              placeholder={projectConfig.notesPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.privacyConsent}
              onChange={(event) => setForm((current) => ({ ...current, privacyConsent: event.target.checked }))}
              className="mt-1"
            />
            Accetto l&apos;informativa privacy per la gestione del brief.
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(event) => setForm((current) => ({ ...current, marketingConsent: event.target.checked }))}
              className="mt-1"
            />
            Accetto comunicazioni commerciali successive.
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || status === "sending"}
            className="inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Invio brief..." : "Invia brief"}
          </button>
          {message ? (
            <p className={`text-sm font-medium ${status === "success" ? "text-emerald-700" : "text-rose-700"}`}>
              {message}
            </p>
          ) : null}
          {status === "success" ? (
            <Link
              href="/area-clienti/web-agency/storico"
              className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Apri storico brief
            </Link>
          ) : null}
        </div>
      </form>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="lux-panel rounded-3xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Sintesi brief</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{projectTypeLabel(form.projectType)}</h3>
          <p className="mt-3 text-sm text-slate-600">{projectSummary}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>Settore: {form.businessSector || "Da definire"}</li>
            <li>Assetto: {form.newSite ? "Nuovo sito" : form.hasExistingSite ? "Sito esistente" : "Da definire"}</li>
            {projectConfig.showMaterialsReady ? <li>Materiali: {form.materialsReady}</li> : null}
            <li>Contatto: {form.contactPreference}</li>
            {latestRequestId ? <li>Ultimo brief inviato: #{latestRequestId}</li> : null}
          </ul>
        </div>

        <div className="lux-panel rounded-3xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Flusso operativo</p>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li>1. Registriamo il brief e lo rendiamo visibile in area admin.</li>
            <li>2. Qualifichiamo budget, obiettivo e materiali disponibili.</li>
            <li>3. Carichiamo proposta o preventivo direttamente nel tuo storico.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
