"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { ClientAreaConfig } from "@/lib/client-area";
import { VISURA_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/visure-payment";
import {
  fetchPublicVisurePricing,
  type PublicVisurePricingRule,
} from "@/lib/visure-pricing-public";

type CatalogItem = {
  serviceType: string;
  provider: string;
  available: boolean;
  title: string;
  description: string;
  resolvedServiceHash?: string;
  resolvedServiceLabel?: string;
};

type WorkspaceProps = {
  area: ClientAreaConfig;
};

type FormState = {
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  companyTaxId: string;
  subjectTaxCode: string;
  subjectName: string;
  subjectSurname: string;
  province: string;
  landRegistryType: string;
  reportType: string;
  plate: string;
};

function buildInitialState(area: ClientAreaConfig): FormState {
  return {
    serviceType: area.serviceOptions[0]?.value || "visura-camerale",
    customerName: "",
    email: "",
    phone: "",
    notes: "",
    companyTaxId: "",
    subjectTaxCode: "",
    subjectName: "",
    subjectSurname: "",
    province: "",
    landRegistryType: "F",
    reportType: "attuale",
    plate: "",
  };
}

export default function OpenApiVisureWorkspace({ area }: WorkspaceProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(() => buildInitialState(area));
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "ready" | "error">("loading");
  const [catalogMessage, setCatalogMessage] = useState("");
  const [pricingRules, setPricingRules] = useState<PublicVisurePricingRule[]>([]);
  const [status, setStatus] = useState<"idle" | "redirecting" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      setCatalogStatus("loading");
      setCatalogMessage("");

      try {
        const response = await fetch("/api/client-area/visure/openapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "catalog" }),
        });
        const payload = (await response.json()) as {
          services?: CatalogItem[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.message || "Catalogo visure non disponibile.");
        }

        if (!active) return;
        setCatalog(Array.isArray(payload.services) ? payload.services : []);
        setCatalogStatus("ready");
      } catch (error) {
        if (!active) return;
        setCatalog([]);
        setCatalogStatus("error");
        setCatalogMessage(
          error instanceof Error ? error.message : "Catalogo visure non disponibile.",
        );
      }
    };

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadPricing = async () => {
      try {
        const payload = await fetchPublicVisurePricing();
        if (!active) return;
        setPricingRules(payload);
      } catch {
        if (!active) return;
        setPricingRules([]);
      }
    };

    loadPricing();
    return () => {
      active = false;
    };
  }, []);

  const catalogItem = useMemo(
    () => catalog.find((item) => item.serviceType === form.serviceType) || null,
    [catalog, form.serviceType],
  );
  const pricingRule = useMemo(
    () =>
      pricingRules.find((rule) => rule.serviceType === form.serviceType && rule.active) || null,
    [pricingRules, form.serviceType],
  );

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildFormData = () => {
    switch (form.serviceType) {
      case "visura-camerale":
        return {
          companyTaxId: form.companyTaxId,
        };
      case "visura-catastale":
        return {
          subjectTaxCode: form.subjectTaxCode,
          province: form.province,
          landRegistryType: form.landRegistryType,
          reportType: form.reportType,
        };
      case "visura-pra":
        return {
          plate: form.plate,
        };
      case "visura-crif":
      case "visura-cr":
        return {
          subjectTaxCode: form.subjectTaxCode,
          subjectName: form.subjectName,
          subjectSurname: form.subjectSurname,
        };
      default:
        return {};
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("redirecting");
    setMessage("");

    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          VISURA_PAYMENT_DRAFT_STORAGE_KEY,
          JSON.stringify({
            serviceType: form.serviceType,
            customerName: form.customerName,
            email: form.email,
            phone: form.phone,
            notes: form.notes,
            resolvedServiceHash: catalogItem?.resolvedServiceHash || "",
            resolvedServiceLabel: catalogItem?.resolvedServiceLabel || catalogItem?.title || "",
            formData: buildFormData(),
          }),
        );
      }

      const response = await fetch("/api/client-area/visure/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: form.serviceType,
          customerName: form.customerName,
          email: form.email,
        }),
      });
      const payload = (await response.json()) as {
        url?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Pagamento visura non avviato.");
      }

      if (!payload.url) {
        throw new Error("URL checkout Stripe non disponibile.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Errore durante il pagamento della visura.");
    }
  };

  useEffect(() => {
    const checkoutState = searchParams.get("visura_checkout");

    if (checkoutState === "cancel") {
      setStatus("error");
      setMessage("Pagamento annullato. La richiesta visura non è stata avviata.");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  return (
    <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="lux-card rounded-3xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
          Servizi disponibili
        </p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Servizi disponibili ora</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Qui vedi quali servizi sono pronti in questo momento e, per PRA/CRIF/CR, quale voce
          operativa è stata collegata al modulo.
        </p>

        {catalogStatus === "loading" ? (
          <p className="mt-5 text-sm text-slate-500">Sto verificando i servizi disponibili...</p>
        ) : null}
        {catalogStatus === "error" ? (
          <p className="mt-5 text-sm font-medium text-red-600">{catalogMessage}</p>
        ) : null}

        {catalogStatus === "ready" ? (
          <div className="mt-5 space-y-3">
            {catalog.map((item) => (
              <div
                key={item.serviceType}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    {item.resolvedServiceLabel ? (
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Catalogo: {item.resolvedServiceLabel}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.available ? "attivo" : "non disponibile"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="lux-card rounded-3xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
          Richiesta visura
        </p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Compila i dati e avvio la richiesta</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/area-clienti/visure/storico"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Vai allo storico visure
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tipo visura
            </span>
            <select
              value={form.serviceType}
              onChange={(event) => updateField("serviceType", event.target.value)}
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
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Nome e cognome
            </span>
            <input
              value={form.customerName}
              onChange={(event) => updateField("customerName", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              placeholder="Chi sta richiedendo la visura"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Email
            </span>
            <input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              type="email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              placeholder="dove inviare gli aggiornamenti"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Telefono
            </span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              placeholder="Per eventuali verifiche rapide"
            />
          </label>
        </div>

        {form.serviceType === "visura-camerale" ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Dati impresa</p>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Codice fiscale / P. IVA
              </span>
              <input
                value={form.companyTaxId}
                onChange={(event) => updateField("companyTaxId", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="Identificativo impresa"
              />
            </label>
          </div>
        ) : null}

        {form.serviceType === "visura-catastale" ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Dati catastali</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Codice fiscale / P. IVA soggetto
                </span>
                <input
                  value={form.subjectTaxCode}
                  onChange={(event) => updateField("subjectTaxCode", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder="Riferimento soggetto"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Provincia
                </span>
                <input
                  value={form.province}
                  onChange={(event) => updateField("province", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder="Es. NA"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Catasto
                </span>
                <select
                  value={form.landRegistryType}
                  onChange={(event) => updateField("landRegistryType", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="F">Fabbricati</option>
                  <option value="T">Terreni</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Tipo visura
                </span>
                <select
                  value={form.reportType}
                  onChange={(event) => updateField("reportType", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="attuale">Attuale</option>
                  <option value="storica">Storica</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {form.serviceType === "visura-pra" ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Dati veicolo</p>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Targa
              </span>
              <input
                value={form.plate}
                onChange={(event) => updateField("plate", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="Es. AB123CD"
              />
            </label>
          </div>
        ) : null}

        {form.serviceType === "visura-crif" || form.serviceType === "visura-cr" ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Dati soggetto</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Nome
                </span>
                <input
                  value={form.subjectName}
                  onChange={(event) => updateField("subjectName", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder="Nome"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Cognome
                </span>
                <input
                  value={form.subjectSurname}
                  onChange={(event) => updateField("subjectSurname", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder="Cognome"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Codice fiscale
                </span>
                <input
                  value={form.subjectTaxCode}
                  onChange={(event) => updateField("subjectTaxCode", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder="Codice fiscale"
                />
              </label>
            </div>
          </div>
        ) : null}

        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Note operative
          </span>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Dettagli utili, urgenze o riferimenti aggiuntivi"
          />
        </label>

        {catalogItem && !catalogItem.available ? (
          <p className="mt-4 text-sm font-medium text-amber-700">
            Questo servizio al momento non risulta disponibile con la configurazione attuale.
          </p>
        ) : null}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Prezzo attuale
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {pricingRule
              ? `${pricingRule.priceEUR.toFixed(2).replace(".", ",")} euro`
              : "Prezzo calcolato automaticamente al checkout"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {pricingRule?.label || "Se non c'è una regola salvata, uso il prezzo base del sistema."}
          </p>
        </div>

        {message ? (
          <p
            className={`mt-4 text-sm font-medium ${
              status === "error" ? "text-red-600" : "text-emerald-700"
            }`}
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "redirecting" || (catalogItem ? !catalogItem.available : false)}
          className="button-link-light mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 shadow-lg shadow-slate-950/15 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "redirecting" ? "Sto aprendo il pagamento..." : "Paga e richiedi visura"}
        </button>
      </form>
    </div>
  );
}
