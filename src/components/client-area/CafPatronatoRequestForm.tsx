"use client";

/**
 * Fact-forcing: CAF checkout + uploads; import PaymentCheckoutNotice + PrivateUploadNotice.
 * Callers: area-clienti CAF pages. User: "procedi su tutto al 100% … chiudiamo questo GAP".
 */
import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { fetchClientPortalProfile, getClientPortalToken } from "@/lib/client-portal-auth";
import {
  CAF_PATRONATO_CATALOG,
  getCafPatronatoScopeLabel,
  getCafPatronatoService,
  type CafPatronatoScope,
} from "@/lib/caf-patronato-catalog";
import { fetchPublicCafPatronatoPricing } from "@/lib/caf-patronato-pricing-public";
import { CAF_PATRONATO_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/caf-patronato-payment";
import type { CafPatronatoPricingRule } from "@/lib/caf-patronato-pricing-engine";
import PaymentCheckoutNotice from "@/components/compliance/PaymentCheckoutNotice";
import PrivateUploadNotice from "@/components/compliance/PrivateUploadNotice";

const inputCls =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";
const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45";
const panelCls = "border border-[var(--ink)]/12 bg-[var(--paper)] p-5 md:p-7";
const primaryBtn =
  "brutal-cta-ink mt-6 inline-flex bg-[var(--ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

type CafPatronatoRequestFormProps = {
  onSummaryChange?: (summary: {
    scope: CafPatronatoScope;
    serviceType: string;
    serviceLabel: string;
    categoryLabel: string;
    filesCount: number;
    preferredContact: string;
    urgency: string;
  }) => void;
};

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  scope: CafPatronatoScope;
  serviceType: string;
  urgency: string;
  preferredContactMethod: string;
  preferredContactDate: string;
  documentSummary: string;
  notes: string;
};

function firstServiceForScope(scope: CafPatronatoScope) {
  return CAF_PATRONATO_CATALOG.find((category) => category.scope === scope)?.services[0]?.value || "";
}

function buildInitialState(): FormState {
  return {
    customerName: "",
    email: "",
    phone: "",
    scope: "caf",
    serviceType: firstServiceForScope("caf"),
    urgency: "",
    preferredContactMethod: "email",
    preferredContactDate: "",
    documentSummary: "",
    notes: "",
  };
}

export default function CafPatronatoRequestForm({
  onSummaryChange,
}: CafPatronatoRequestFormProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(buildInitialState);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pricingRules, setPricingRules] = useState<CafPatronatoPricingRule[]>([]);
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const availableCategories = useMemo(
    () => CAF_PATRONATO_CATALOG.filter((category) => category.scope === form.scope),
    [form.scope],
  );
  const selectedService = useMemo(
    () => getCafPatronatoService(form.serviceType),
    [form.serviceType],
  );
  const selectedPricingRule = useMemo(
    () =>
      pricingRules.find((rule) => rule.active && rule.serviceType === form.serviceType) || null,
    [form.serviceType, pricingRules],
  );
  const selectedPriceEUR = selectedPricingRule?.priceEUR ?? selectedService?.priceEUR ?? 0;
  const selectedPriceLabel =
    selectedPricingRule?.label ||
    (selectedService ? `${selectedService.label} CAF/Patronato` : "Prezzo in attesa");

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
        setForm((current) => ({
          ...current,
          customerName: current.customerName || profile.fullName || "",
          email: current.email || profile.email || profile.username || "",
          phone: current.phone || profile.phone || "",
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

  useEffect(() => {
    if (!selectedService) {
      const nextService = firstServiceForScope(form.scope);
      if (nextService && nextService !== form.serviceType) {
        setForm((current) => ({ ...current, serviceType: nextService }));
      }
    }
  }, [form.scope, form.serviceType, selectedService]);

  useEffect(() => {
    let active = true;

    async function loadPricing() {
      try {
        const rules = await fetchPublicCafPatronatoPricing();
        if (!active) return;
        setPricingRules(rules);
      } catch {
        if (!active) return;
        setPricingRules([]);
      }
    }

    void loadPricing();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!onSummaryChange) return;
    const preferredContact = [
      form.preferredContactMethod ? `Via ${form.preferredContactMethod}` : "",
      form.preferredContactDate || "",
    ]
      .filter(Boolean)
      .join(" il ");

    onSummaryChange({
      scope: form.scope,
      serviceType: form.serviceType,
      serviceLabel: selectedService?.label || "Seleziona un servizio",
      categoryLabel: selectedService?.categoryTitle || "In attesa di scelta",
      filesCount: files.length,
      preferredContact,
      urgency: form.urgency || "Da definire",
    });
  }, [
    files.length,
    form.preferredContactDate,
    form.preferredContactMethod,
    form.scope,
    form.serviceType,
    form.urgency,
    onSummaryChange,
    selectedService,
  ]);

  useEffect(() => {
    const checkoutState = searchParams.get("caf_checkout");
    if (checkoutState === "cancel") {
      setStatus("error");
      setMessage("Pagamento annullato. La pratica non è stata inviata al team.");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  const appendFiles = (incoming: FileList | File[]) => {
    const nextFiles = Array.from(incoming).filter((file) => file.size > 0);
    if (!nextFiles.length) return;

    setFiles((current) => {
      const existing = new Set(current.map((file) => `${file.name}:${file.size}`));
      const merged = [...current];
      for (const file of nextFiles) {
        const key = `${file.name}:${file.size}`;
        if (!existing.has(key)) {
          merged.push(file);
          existing.add(key);
        }
      }
      return merged;
    });
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    appendFiles(event.dataTransfer.files);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const body = new FormData();
      body.set("customerName", form.customerName);
      body.set("email", form.email);
      body.set("phone", form.phone);
      body.set("scope", form.scope);
      body.set("serviceType", form.serviceType);
      body.set("urgency", form.urgency);
      body.set("preferredContactMethod", form.preferredContactMethod);
      body.set("preferredContactDate", form.preferredContactDate);
      body.set("documentSummary", form.documentSummary);
      body.set("notes", form.notes);
      body.set("token", getClientPortalToken());
      for (const file of files) {
        body.append("files", file);
      }

      const response = await fetch("/api/client-area/caf-patronato/checkout", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as { message?: string; url?: string; draftToken?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Impossibile avviare il pagamento.");
      }

      if (!payload.url || !payload.draftToken) {
        throw new Error("Dati checkout Stripe non disponibili.");
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(CAF_PATRONATO_PAYMENT_DRAFT_STORAGE_KEY, payload.draftToken);
      }

      window.location.href = payload.url;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Errore durante il pagamento della pratica.");
    }
  };

  return (
    <form onSubmit={onSubmit} className={`${panelCls} self-start`}>
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
          Nuova pratica
        </p>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Apri la tua richiesta online</h2>
        <p className="text-sm leading-relaxed text-[var(--ink)]/55">
          Compila i dati principali, allega i documenti che hai già pronti e il team riceve subito
          una mail operativa per iniziare la lavorazione.
        </p>
        {profileStatus === "ready" ? (
          <p className="text-xs font-medium text-[#5E0ED7]">
            Ho precaricato nome, email e telefono dal tuo profilo cliente.
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Nome e cognome</span>
          <input
            value={form.customerName}
            onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
            className={inputCls}
            placeholder="Inserisci il nominativo"
            required
          />
        </label>
        <label className="block">
          <span className={labelCls}>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className={inputCls}
            placeholder="nome@dominio.it"
            required
          />
        </label>
        <label className="block">
          <span className={labelCls}>Telefono</span>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className={inputCls}
            placeholder="Numero di contatto"
          />
        </label>
        <label className="block">
          <span className={labelCls}>Area</span>
          <select
            value={form.scope}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                scope: event.target.value as CafPatronatoScope,
                serviceType: firstServiceForScope(event.target.value as CafPatronatoScope),
              }))
            }
            className={inputCls}
          >
            <option value="caf">CAF</option>
            <option value="patronato">Patronato</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className={labelCls}>Servizio richiesto</span>
          <select
            value={form.serviceType}
            onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value }))}
            className={inputCls}
            required
          >
            {availableCategories.map((category) => (
              <optgroup key={category.id} label={`${category.icon} ${category.title}`}>
                {category.services.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label} · {service.priceEUR.toFixed(2).replace(".", ",")} €
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {selectedService ? (
            <p className="mt-2 text-xs leading-5 text-[var(--ink)]/50">
              {selectedService.description} Prezzo cliente:{" "}
              <span className="font-semibold text-[var(--ink)]">
                {selectedPriceEUR.toFixed(2).replace(".", ",")} €
              </span>
              <span className="ml-1 text-[var(--ink)]/45">· {selectedPriceLabel}</span>
            </p>
          ) : null}
        </label>
        <label className="block">
          <span className={labelCls}>Urgenza pratica</span>
          <input
            value={form.urgency}
            onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value }))}
            className={inputCls}
            placeholder="Es. entro 3 giorni"
          />
        </label>
        <label className="block">
          <span className={labelCls}>Contatto preferito</span>
          <select
            value={form.preferredContactMethod}
            onChange={(event) =>
              setForm((current) => ({ ...current, preferredContactMethod: event.target.value }))
            }
            className={inputCls}
          >
            <option value="email">Email</option>
            <option value="telefono">Telefono</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="appuntamento">Appuntamento</option>
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Data preferita</span>
          <input
            type="date"
            value={form.preferredContactDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, preferredContactDate: event.target.value }))
            }
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Documenti già pronti</span>
          <input
            value={form.documentSummary}
            onChange={(event) =>
              setForm((current) => ({ ...current, documentSummary: event.target.value }))
            }
            className={inputCls}
            placeholder="Es. CUD, SPID, documento identità"
          />
        </label>
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={`mt-5 flex cursor-pointer flex-col border border-dashed px-5 py-6 transition ${
          dragActive
            ? "border-[#5E0ED7] bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
            : "border-[var(--ink)]/20 hover:border-[#5E0ED7]"
        }`}
      >
        <input
          type="file"
          className="hidden"
          multiple
          onChange={(event) => appendFiles(event.target.files || [])}
        />
        <span className="text-sm font-semibold text-[var(--ink)]">
          Trascina qui i documenti oppure clicca per allegarli
        </span>
        <span className="mt-2 text-sm text-[var(--ink)]/50">
          Puoi caricare documenti già pronti per accelerare la presa in carico della pratica.
        </span>
        <PrivateUploadNotice className="mt-3" />
      </label>

      {files.length ? (
        <div className="mt-4 border border-[var(--ink)]/12 bg-[var(--paper)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
            Allegati pronti ({files.length})
          </p>
          <div className="mt-3 grid gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_90%,white)] px-3.5 py-3 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-[var(--ink)]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="ml-4 shrink-0 border border-[var(--ink)]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/60 transition hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <label className="mt-5 block">
        <span className={labelCls}>Note per il team</span>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          className={`${inputCls} min-h-28 py-3`}
          rows={5}
          placeholder="Raccontaci cosa ti serve, se hai scadenze o se vuoi essere richiamato in una fascia oraria precisa."
        />
      </label>

      {message ? <p className="mt-4 text-sm font-medium text-red-700">{message}</p> : null}

      <button type="submit" disabled={status === "submitting"} className={primaryBtn}>
        {status === "submitting"
          ? "Reindirizzamento a Stripe..."
          : `Paga e invia richiesta ${getCafPatronatoScopeLabel(form.scope)}`}
      </button>
      <PaymentCheckoutNotice
        className="mt-3"
        amountLabel={
          selectedPriceEUR > 0
            ? `${selectedPriceEUR.toFixed(2).replace(".", ",")} €`
            : undefined
        }
      />
    </form>
  );
}
