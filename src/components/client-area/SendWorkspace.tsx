"use client";

/**
 * Fact-forcing: existing SEND checkout/upload; wire PaymentCheckoutNotice + PrivateUploadNotice.
 * Callers: area-clienti send pages. User: "procedi su tutto al 100% … chiudiamo questo GAP".
 */
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getClientPortalToken } from "@/lib/client-portal-auth";
import DatePicker from "@/components/ui/DatePicker";
import PaymentCheckoutNotice from "@/components/compliance/PaymentCheckoutNotice";
import PrivateUploadNotice from "@/components/compliance/PrivateUploadNotice";

type ApplicantType = "destinatario" | "delegato" | "impresa" | "delegato_impresa";
type Step = "details" | "documents" | "status";

type Person = {
  first_name: string;
  last_name: string;
  tax_code: string;
};

type Company = {
  business_name: string;
  vat_number: string;
  tax_code: string;
};

type UploadedDocument = {
  id?: string | number;
  category: string;
  name: string;
};

const SEND_CHECKOUT_DRAFT_KEY = "ag:send-checkout-draft";

const inputCls =
  "h-11 w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";
const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45";
const textareaCls = `${inputCls} min-h-24 py-3`;
const selectCls = inputCls;
const panelCls = "border border-[var(--ink)]/12 bg-[var(--paper)] p-5 md:p-7";
const primaryBtn =
  "brutal-cta-ink inline-flex items-center gap-2 bg-[var(--ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-wait disabled:opacity-50";
const ghostBtn =
  "border border-[var(--ink)]/20 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/70 transition hover:border-[var(--ink)]/40 hover:text-[var(--ink)] disabled:opacity-40";

const APPLICANTS: Array<{ value: ApplicantType; label: string; hint: string }> = [
  { value: "destinatario", label: "Destinatario", hint: "La notifica è intestata a te" },
  { value: "delegato", label: "Delegato", hint: "Agisci per un’altra persona" },
  { value: "impresa", label: "Impresa", hint: "Agisci come rappresentante" },
  { value: "delegato_impresa", label: "Delegato impresa", hint: "Agisci su delega di un’impresa" },
];

const DOCUMENT_CATEGORIES: Record<ApplicantType, Array<{ value: string; label: string }>> = {
  destinatario: [
    { value: "avviso_send", label: "Avviso SEND" },
    { value: "doc_destinatario_fronte", label: "Documento destinatario — fronte" },
    { value: "doc_destinatario_retro", label: "Documento destinatario — retro" },
    { value: "cf_destinatario", label: "Codice fiscale destinatario" },
    { value: "avviso_pagamento", label: "Avviso di pagamento" },
    { value: "altro", label: "Altro" },
  ],
  delegato: [
    { value: "avviso_send", label: "Avviso SEND" },
    { value: "doc_destinatario_fronte", label: "Documento destinatario — fronte" },
    { value: "doc_destinatario_retro", label: "Documento destinatario — retro" },
    { value: "cf_destinatario", label: "Codice fiscale destinatario" },
    { value: "delega", label: "Delega" },
    { value: "doc_delegato_fronte", label: "Documento delegato — fronte" },
    { value: "doc_delegato_retro", label: "Documento delegato — retro" },
    { value: "cf_delegato", label: "Codice fiscale delegato" },
    { value: "altro", label: "Altro" },
  ],
  impresa: [
    { value: "avviso_send", label: "Avviso SEND" },
    { value: "doc_rappresentante", label: "Documento rappresentante" },
    { value: "cf_rappresentante", label: "Codice fiscale rappresentante" },
    { value: "visura", label: "Visura camerale" },
    { value: "poteri_rappresentanza", label: "Poteri di rappresentanza" },
    { value: "autocertificazione", label: "Autocertificazione" },
    { value: "altro", label: "Altro" },
  ],
  delegato_impresa: [
    { value: "avviso_send", label: "Avviso SEND" },
    { value: "delega", label: "Delega" },
    { value: "doc_delegato_fronte", label: "Documento delegato — fronte" },
    { value: "doc_delegato_retro", label: "Documento delegato — retro" },
    { value: "cf_delegato", label: "Codice fiscale delegato" },
    { value: "visura", label: "Visura camerale" },
    { value: "poteri_rappresentanza", label: "Poteri di rappresentanza" },
    { value: "altro", label: "Altro" },
  ],
};

const CHECKLIST: Record<ApplicantType, string[]> = {
  destinatario: ["identita_verificata", "privacy", "avviso_send", "documento_destinatario", "cf_destinatario"],
  delegato: ["identita_verificata", "privacy", "avviso_send", "documento_destinatario", "cf_destinatario", "delega", "documento_delegato", "cf_delegato"],
  impresa: ["identita_verificata", "privacy", "avviso_send", "documento_rappresentante", "cf_rappresentante", "dati_impresa", "poteri_rappresentanza"],
  delegato_impresa: ["identita_verificata", "privacy", "avviso_send", "delega", "documento_delegato", "cf_delegato", "dati_impresa", "poteri_rappresentanza"],
};

const REQUIRED_DOCUMENTS: Record<ApplicantType, Array<{ categories: string[]; label: string }>> = {
  destinatario: [
    { categories: ["avviso_send"], label: "Avviso SEND" },
    { categories: ["doc_destinatario_fronte"], label: "Documento destinatario — fronte" },
    { categories: ["doc_destinatario_retro"], label: "Documento destinatario — retro" },
    { categories: ["cf_destinatario"], label: "Codice fiscale destinatario" },
  ],
  delegato: [
    { categories: ["avviso_send"], label: "Avviso SEND" },
    { categories: ["doc_destinatario_fronte"], label: "Documento destinatario — fronte" },
    { categories: ["doc_destinatario_retro"], label: "Documento destinatario — retro" },
    { categories: ["cf_destinatario"], label: "Codice fiscale destinatario" },
    { categories: ["delega"], label: "Delega" },
    { categories: ["doc_delegato_fronte"], label: "Documento delegato — fronte" },
    { categories: ["doc_delegato_retro"], label: "Documento delegato — retro" },
    { categories: ["cf_delegato"], label: "Codice fiscale delegato" },
  ],
  impresa: [
    { categories: ["avviso_send"], label: "Avviso SEND" },
    { categories: ["doc_rappresentante"], label: "Documento rappresentante" },
    { categories: ["cf_rappresentante"], label: "Codice fiscale rappresentante" },
    { categories: ["visura"], label: "Visura camerale" },
    { categories: ["poteri_rappresentanza"], label: "Poteri di rappresentanza" },
  ],
  delegato_impresa: [
    { categories: ["avviso_send"], label: "Avviso SEND" },
    { categories: ["delega"], label: "Delega" },
    { categories: ["doc_delegato_fronte"], label: "Documento delegato — fronte" },
    { categories: ["doc_delegato_retro"], label: "Documento delegato — retro" },
    { categories: ["cf_delegato"], label: "Codice fiscale delegato" },
    { categories: ["visura"], label: "Visura camerale" },
    { categories: ["poteri_rappresentanza"], label: "Poteri di rappresentanza" },
  ],
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Bozza",
  submitted: "Inviata",
  awaiting_assignment: "In attesa di assegnazione",
  assigned: "Assegnata",
  taken_in_charge: "Presa in carico",
  processing: "In lavorazione",
  integration_required: "Integrazione richiesta",
  resubmitted: "Reinviata",
  completed: "Completata",
  delivered: "Consegnata",
  closed: "Chiusa",
  rejected: "Respinta",
  cancelled: "Annullata",
  expired: "Scaduta",
};

function emptyPerson(): Person {
  return { first_name: "", last_name: "", tax_code: "" };
}

function apiError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof payload.message === "string") return payload.message;
    if ("error" in payload && payload.error && typeof payload.error === "object" && "message" in payload.error) {
      return String(payload.error.message);
    }
  }
  return fallback;
}

function extractData(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && "data" in payload && payload.data && typeof payload.data === "object") {
    return payload.data as Record<string, unknown>;
  }
  return {};
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}{required && <span className="text-[#5E0ED7]"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function PersonFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: Person;
  onChange: (person: Person) => void;
}) {
  return (
    <fieldset className={`${panelCls} mt-4`}>
      <legend className={`px-1 ${labelCls}`}>{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" value={value.first_name} required onChange={(first_name) => onChange({ ...value, first_name })} />
        <Field label="Cognome" value={value.last_name} required onChange={(last_name) => onChange({ ...value, last_name })} />
        <div className="sm:col-span-2">
          <Field label="Codice fiscale" value={value.tax_code} required placeholder="RSSMRA80A01H501U" onChange={(tax_code) => onChange({ ...value, tax_code: tax_code.toUpperCase() })} />
        </div>
      </div>
    </fieldset>
  );
}

function TrustIcon({ type }: { type: "lock" | "file" | "support" }) {
  if (type === "file") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M7 3.5h7l4 4V20.5H7zM14 3.5v4h4M10 12h5M10 15.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "support") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M5 14v-2a7 7 0 0 1 14 0v2M5 14H3.5v4H7v-4H5Zm14 0h1.5v4H17v-4h2ZM17 19.5c-1 1-2.5 1.5-4.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PublicTrustPanel({ priceLabel }: { priceLabel: string }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className={panelCls}>
        <div className="mb-6 flex items-end justify-between border-b border-[var(--ink)]/10 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Costo del servizio</p>
            <p className="display-type mt-2 text-3xl">{priceLabel || "—"}</p>
          </div>
          <span className="mb-1 border border-[var(--ink)]/15 px-2.5 py-1 text-[10px] text-[var(--ink)]/50">IVA inclusa</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">Prima di iniziare</p>
        <h2 className="mt-3 text-lg font-semibold text-[var(--ink)]">Tieni a portata di mano</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink)]/60">
          {["L’avviso SEND ricevuto", "Un documento d’identità valido", "Il codice fiscale", "Eventuale delega o visura"].map((item, index) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--ink)]/20 text-[10px] font-bold text-[var(--ink)]">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${panelCls} divide-y divide-[var(--ink)]/10`}>
        {[
          { type: "lock" as const, title: "Dati protetti", text: "Trasmissione cifrata e chiavi custodite esclusivamente sul server." },
          { type: "file" as const, title: "Pratica tracciata", text: "Ogni richiesta riceve un identificativo e uno stato verificabile." },
          { type: "support" as const, title: "Assistenza reale", text: "La pratica viene controllata da un operatore AG SERVIZI." },
        ].map((item) => (
          <div key={item.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)]">
              <TrustIcon type={item.type} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--ink)]/55">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="px-2 text-center text-[11px] leading-5 text-[var(--ink)]/45">
        AG SERVIZI · Via Plinio il Vecchio 72<br />Castellammare di Stabia
      </p>
    </aside>
  );
}

export default function SendWorkspace({ guest = false }: { guest?: boolean }) {
  const [sessionReady, setSessionReady] = useState(!guest);
  const [step, setStep] = useState<Step>("details");
  const [applicantType, setApplicantType] = useState<ApplicantType>("destinatario");
  const [priority, setPriority] = useState("normale");
  const [identifier, setIdentifier] = useState("");
  const [iun, setIun] = useState("");
  const [senderEntity, setSenderEntity] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [destinatario, setDestinatario] = useState<Person>(emptyPerson);
  const [delegato, setDelegato] = useState<Person>(emptyPerson);
  const [rappresentante, setRappresentante] = useState<Person>(emptyPerson);
  const [impresa, setImpresa] = useState<Company>({ business_name: "", vat_number: "", tax_code: "" });
  const [privacy, setPrivacy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [uuid, setUuid] = useState("");
  const [requestNumber, setRequestNumber] = useState("");
  const [status, setStatus] = useState("draft");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [category, setCategory] = useState("avviso_send");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [priceLabel, setPriceLabel] = useState("");
  const [checkoutHandled, setCheckoutHandled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useCallback((): Record<string, string> => {
    const token = getClientPortalToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    if (!guest) return;
    let active = true;
    void fetch("/api/send/guest-session", {
      method: "POST",
      credentials: "same-origin",
    }).then((response) => {
      if (!response.ok) throw new Error("Sessione ospite non disponibile");
      if (active) setSessionReady(true);
    }).catch(() => {
      if (active) setError("Non è stato possibile avviare la sessione ospite. Ricarica la pagina.");
    });
    return () => {
      active = false;
    };
  }, [guest]);

  useEffect(() => {
    if (!sessionReady) return;
    let active = true;
    void fetch("/api/client-area/send/pricing", {
      headers: authHeaders(),
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json() as {
          label?: string;
          priceLabel?: string;
          message?: string;
        };
        if (!response.ok) throw new Error(payload.message || "Tariffa non disponibile");
        if (active) setPriceLabel(payload.label || payload.priceLabel || "6,50 €");
      })
      .catch(() => {
        if (active) setPriceLabel("6,50 €");
      });
    return () => {
      active = false;
    };
  }, [authHeaders, sessionReady]);

  const categories = DOCUMENT_CATEGORIES[applicantType];
  const missingDocuments = useMemo(() => {
    const uploaded = new Set(documents.map((document) => document.category));
    return REQUIRED_DOCUMENTS[applicantType].filter(
      (requirement) => !requirement.categories.some((requiredCategory) => uploaded.has(requiredCategory)),
    );
  }, [applicantType, documents]);

  useEffect(() => {
    setCategory(DOCUMENT_CATEGORIES[applicantType][0].value);
  }, [applicantType]);

  const refresh = useCallback(async () => {
    if (!uuid) return;
    const response = await fetch(`/api/client-area/send/requests/${encodeURIComponent(uuid)}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    const payload: unknown = await response.json();
    if (!response.ok) throw new Error(apiError(payload, "Stato non disponibile"));
    const data = extractData(payload);
    const state = data.status;
    setStatus(typeof state === "object" && state && "value" in state ? String(state.value) : String(state || "draft"));
    const upstreamDocuments = Array.isArray(data.documents) ? data.documents : [];
    setDocuments(upstreamDocuments.map((item) => {
      const doc = item as Record<string, unknown>;
      return {
        id: typeof doc.id === "number" || typeof doc.id === "string" ? doc.id : undefined,
        category: String(doc.category || "documento"),
        name: String(doc.original_name || doc.filename || doc.name || "Documento"),
      };
    }));
  }, [authHeaders, uuid]);

  useEffect(() => {
    if (!sessionReady || checkoutHandled || typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const checkoutState = search.get("send_checkout");
    const restoredUuid = search.get("uuid") || "";
    const sessionId = search.get("session_id") || "";
    if (!checkoutState || !restoredUuid) return;

    setCheckoutHandled(true);
    setUuid(restoredUuid);
    try {
      const saved = JSON.parse(
        window.sessionStorage.getItem(SEND_CHECKOUT_DRAFT_KEY) || "{}",
      ) as { applicantType?: ApplicantType; contactEmail?: string };
      if (saved.applicantType && APPLICANTS.some((item) => item.value === saved.applicantType)) {
        setApplicantType(saved.applicantType);
      }
      if (saved.contactEmail) setContactEmail(saved.contactEmail);
    } catch {
      // La sessione firmata resta la fonte di autorizzazione.
    }
    if (checkoutState === "cancel") {
      setStep("documents");
      setMessage("Pagamento annullato. La bozza e i documenti sono ancora disponibili.");
      void fetch(`/api/client-area/send/requests/${encodeURIComponent(restoredUuid)}`, {
        headers: authHeaders(),
        cache: "no-store",
      }).then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) return;
        const data = extractData(payload);
        const upstreamDocuments = Array.isArray(data.documents) ? data.documents : [];
        setDocuments(upstreamDocuments.map((item) => {
          const doc = item as Record<string, unknown>;
          return {
            id: typeof doc.id === "number" || typeof doc.id === "string" ? doc.id : undefined,
            category: String(doc.category || "documento"),
            name: String(doc.original_name || doc.filename || doc.name || "Documento"),
          };
        }));
      });
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (checkoutState !== "success" || !sessionId) return;

    setBusy(true);
    setStep("status");
    setMessage("Pagamento ricevuto. Stiamo inviando la pratica SEND.");
    void fetch(
      `/api/client-area/send/requests/${encodeURIComponent(restoredUuid)}/checkout/verify`,
      {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      },
    )
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) throw new Error(apiError(payload, "Verifica pagamento non riuscita"));
        const verifiedStatus =
          payload && typeof payload === "object" && "status" in payload
            ? String(payload.status || "submitted")
            : "submitted";
        setStatus(verifiedStatus);
        setMessage(
          verifiedStatus && verifiedStatus !== "draft"
            ? "Pagamento confermato. La pratica è stata inviata correttamente."
            : "Pagamento confermato. La pratica è in fase di invio.",
        );
        window.sessionStorage.removeItem(SEND_CHECKOUT_DRAFT_KEY);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Verifica pagamento non riuscita");
      })
      .finally(() => setBusy(false));
  }, [authHeaders, checkoutHandled, sessionReady]);

  useEffect(() => {
    if (!uuid || step !== "status") return;
    const timer = window.setInterval(() => void refresh().catch(() => undefined), 15000);
    return () => window.clearInterval(timer);
  }, [refresh, step, uuid]);

  const subjects = useMemo(() => {
    if (applicantType === "destinatario") return { destinatario };
    if (applicantType === "delegato") return { destinatario, delegato };
    if (applicantType === "impresa") return { impresa, rappresentante };
    return { impresa, delegato };
  }, [applicantType, delegato, destinatario, impresa, rappresentante]);

  async function createDraft(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/client-area/send/requests", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_type: applicantType,
          priority,
          send_notice_identifier: identifier || undefined,
          iun: iun || undefined,
          sender_entity: senderEntity || undefined,
          notice_date: noticeDate || undefined,
          received_date: receivedDate || undefined,
          due_date: dueDate || undefined,
          initial_notes: notes || undefined,
          subjects,
          consents: { privacy },
          submit: false,
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(apiError(payload, "Non è stato possibile creare la bozza"));
      const data = extractData(payload);
      setUuid(String(data.uuid || ""));
      setRequestNumber(String(data.request_number || ""));
      setStatus("draft");
      setStep("documents");
      setMessage("Bozza creata. Ora allega i documenti necessari.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Operazione non riuscita");
    } finally {
      setBusy(false);
    }
  }

  async function uploadDocument(event: FormEvent) {
    event.preventDefault();
    if (!file || !uuid) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      const response = await fetch(`/api/client-area/send/requests/${encodeURIComponent(uuid)}/documents`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(apiError(payload, "Caricamento non riuscito"));
      setDocuments((current) => [...current, { category, name: file.name }]);
      setFile(null);
      const input = document.getElementById("send-document") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage("Documento caricato correttamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Caricamento non riuscito");
    } finally {
      setBusy(false);
    }
  }

  async function submitRequest() {
    if (!uuid) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const patchResponse = await fetch(`/api/client-area/send/requests/${encodeURIComponent(uuid)}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist: CHECKLIST[applicantType],
          consents: { privacy: true },
        }),
      });
      const patchPayload: unknown = await patchResponse.json();
      if (!patchResponse.ok) throw new Error(apiError(patchPayload, "Verifica dei requisiti non riuscita"));

      const response = await fetch(`/api/client-area/send/requests/${encodeURIComponent(uuid)}/checkout`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail,
          returnPath: guest ? "/send" : "/area-clienti/send",
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(apiError(payload, "Pagamento non disponibile"));
      const checkoutUrl =
        payload && typeof payload === "object" && "url" in payload
          ? String(payload.url || "")
          : "";
      if (!checkoutUrl) throw new Error("URL di pagamento non disponibile");
      window.sessionStorage.setItem(
        SEND_CHECKOUT_DRAFT_KEY,
        JSON.stringify({ applicantType, contactEmail }),
      );
      window.location.assign(checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invio non riuscito");
    } finally {
      setBusy(false);
    }
  }

  const stepIndex = step === "details" ? 0 : step === "documents" ? 1 : 2;

  if (!sessionReady) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="text-center">
          <span className="mx-auto block h-7 w-7 animate-spin border-2 border-[var(--ink)]/15 border-t-[#5E0ED7]" />
          <p className="mt-4 text-sm text-[var(--ink)]/50">Prepariamo la tua richiesta SEND…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-full bg-[var(--paper)] text-[var(--ink)] ${
        guest ? "px-5 pb-8 pt-24 md:px-10 md:pb-10 md:pt-28" : "px-5 py-8 pb-8 md:px-8 md:pb-10"
      }`}
    >
      <div className={guest ? "mx-auto max-w-6xl" : "w-full"}>
        <section className={`mb-10 ${guest ? "border-b border-[var(--ink)]/10 pb-10 md:pb-12" : "border-b border-[var(--ink)]/10 pb-8"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
            {guest ? "Sportello pubblico" : "Area clienti"} · SEND
          </p>
          <h1 className="display-type mt-3 max-w-3xl text-[clamp(2rem,4vw,3.25rem)]">
            La tua notifica, seguita fino all’esito
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink)]/55 md:text-base">
            Inserisci i dati dell’avviso, allega i documenti richiesti e invia la pratica in modo protetto. Un operatore
            verifica ogni passaggio.
          </p>
          {guest && (
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--ink)]/50">
              <li>Nessuna registrazione</li>
              <li>Bozza salvata</li>
              <li>Stato aggiornato</li>
            </ul>
          )}
          {uuid ? (
            <p className="mt-6 inline-flex border border-[var(--ink)]/12 px-4 py-2 text-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/40">Pratica</span>
              <span className="ml-3 font-semibold">{requestNumber || uuid.slice(0, 8)}</span>
            </p>
          ) : null}
        </section>

        <ol className="mb-8 grid grid-cols-3 gap-px bg-[var(--ink)]/10" aria-label="Avanzamento pratica">
          {["Dati", "Documenti", "Stato"].map((label, index) => (
            <li
              key={label}
              className={`px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] ${
                index <= stepIndex
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-[var(--paper)] text-[var(--ink)]/40"
              }`}
            >
              <span className="mr-2 opacity-60">0{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <div className={guest ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]" : ""}>
          <div className="min-w-0">
        {(message || error) && (
          <div
            role={error ? "alert" : "status"}
            className={`mb-6 border px-4 py-3 text-sm ${
              error
                ? "border-red-700/25 bg-red-50 text-red-900"
                : "border-emerald-700/25 bg-emerald-50 text-emerald-900"
            }`}
          >
            {error || message}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={createDraft} className="space-y-6">
            <section className={panelCls}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Chi presenta la richiesta?</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {APPLICANTS.map((item) => (
                  <label
                    key={item.value}
                    className={`cursor-pointer border p-4 transition ${
                      applicantType === item.value
                        ? "border-[#5E0ED7] bg-[color-mix(in_srgb,var(--paper)_90%,#5E0ED7_8%)]"
                        : "border-[var(--ink)]/12 hover:border-[var(--ink)]/25"
                    }`}
                  >
                    <input className="sr-only" type="radio" name="applicant" value={item.value} checked={applicantType === item.value} onChange={() => setApplicantType(item.value)} />
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--ink)]/55">{item.hint}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className={panelCls}>
              <h2 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Dati dell’avviso</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Identificativo avviso" value={identifier} onChange={setIdentifier} />
                <Field label="IUN" value={iun} onChange={(value) => setIun(value.toUpperCase())} />
                <Field label="Ente mittente" value={senderEntity} onChange={setSenderEntity} />
                <DatePicker
                  id="send-notice-date"
                  label="Data avviso"
                  value={noticeDate}
                  onChange={setNoticeDate}
                  minDate="1900-01-01"
                  placeholder="Seleziona data"
                />
                <DatePicker
                  id="send-received-date"
                  label="Data ricezione"
                  value={receivedDate}
                  onChange={setReceivedDate}
                  minDate="1900-01-01"
                  placeholder="Seleziona data"
                />
                <DatePicker
                  id="send-due-date"
                  label="Scadenza"
                  value={dueDate}
                  onChange={setDueDate}
                  minDate="1900-01-01"
                  placeholder="Seleziona data"
                />
                <label className="block">
                  <span className={labelCls}>Priorità</span>
                  <select value={priority} onChange={(event) => setPriority(event.target.value)} className={selectCls}>
                    <option value="normale">Normale</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </label>
                <div className="sm:col-span-2 lg:col-span-1">
                  <Field
                    label="Email per pagamento e ricevuta"
                    type="email"
                    value={contactEmail}
                    required
                    placeholder="nome@email.it"
                    onChange={setContactEmail}
                  />
                </div>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Note iniziali</span>
                  <textarea value={notes} maxLength={5000} onChange={(event) => setNotes(event.target.value)} className={textareaCls} />
                </label>
              </div>
            </section>

            <section className={`${panelCls} space-y-4`}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Soggetti della pratica</h2>
              {(applicantType === "destinatario" || applicantType === "delegato") && <PersonFields title="Destinatario" value={destinatario} onChange={setDestinatario} />}
              {(applicantType === "delegato" || applicantType === "delegato_impresa") && <PersonFields title="Delegato" value={delegato} onChange={setDelegato} />}
              {(applicantType === "impresa" || applicantType === "delegato_impresa") && (
                <fieldset className={panelCls}>
                  <legend className={`px-1 ${labelCls}`}>Impresa</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Field label="Ragione sociale" value={impresa.business_name} required onChange={(business_name) => setImpresa({ ...impresa, business_name })} /></div>
                    <Field label="Partita IVA" value={impresa.vat_number} required onChange={(vat_number) => setImpresa({ ...impresa, vat_number })} />
                    <Field label="Codice fiscale" value={impresa.tax_code} required onChange={(tax_code) => setImpresa({ ...impresa, tax_code })} />
                  </div>
                </fieldset>
              )}
              {applicantType === "impresa" && <PersonFields title="Rappresentante" value={rappresentante} onChange={setRappresentante} />}
            </section>

            <label className={`flex items-start gap-3 border border-[var(--ink)]/12 p-5 text-sm leading-6 text-[var(--ink)]/65`}>
              <input type="checkbox" required checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} className="mt-1 h-4 w-4 accent-[#5E0ED7]" />
              <span>Confermo di aver letto l’informativa privacy e autorizzo il trattamento dei dati necessari alla gestione della pratica.</span>
            </label>

            <div className="flex justify-end">
              <button type="submit" disabled={busy} className={primaryBtn}>
                {busy ? "Creazione in corso…" : "Crea bozza e continua"}
              </button>
            </div>
          </form>
        )}

        {step === "documents" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
            <form onSubmit={uploadDocument} className={panelCls}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Allega un documento</h2>
              <p className="mt-1 text-sm text-[var(--ink)]/55">PDF, JPG, PNG o WEBP, massimo 20 MB per file.</p>
              <label className="mt-5 block">
                <span className={labelCls}>Tipo di documento</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className={selectCls}>
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block border border-dashed border-[var(--ink)]/20 p-5 text-center transition hover:border-[#5E0ED7]">
                <span className="block text-sm font-medium">{file?.name || "Scegli il file"}</span>
                <span className="mt-1 block text-xs text-[var(--ink)]/45">Clicca per sfogliare i documenti</span>
                <input
                  id="send-document"
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
              <button type="submit" disabled={busy || !file} className={`mt-5 w-full ${primaryBtn} justify-center`}>
                {busy ? "Caricamento…" : "Carica documento"}
              </button>
              <PrivateUploadNotice className="mt-3" />
            </form>

            <section className={panelCls}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Documenti caricati</h2>
              {documents.length === 0 ? (
                <p className="mt-6 border border-[var(--ink)]/10 px-4 py-6 text-center text-sm text-[var(--ink)]/45">
                  Nessun documento caricato.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {documents.map((document, index) => (
                    <li
                      key={`${document.category}-${document.id || index}`}
                      className="flex items-center gap-3 border border-[var(--ink)]/12 px-3.5 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-emerald-700/30 text-emerald-800">
                        ✓
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{document.name}</span>
                        <span className="block text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]/45">
                          {document.category.replaceAll("_", " ")}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <label className={`flex items-start gap-3 border border-[var(--ink)]/12 p-5 text-sm leading-6 text-[var(--ink)]/65 lg:col-span-2`}>
              <input
                type="checkbox"
                checked={verified}
                onChange={(event) => setVerified(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#5E0ED7]"
              />
              <span>
                Confermo che identità, dati e documenti inseriti sono stati verificati e corrispondono alla notifica.
              </span>
            </label>

            {missingDocuments.length > 0 && (
              <div className="border border-amber-700/25 bg-amber-50 p-5 lg:col-span-2">
                <p className="text-sm font-semibold text-amber-900">Documenti ancora necessari</p>
                <ul className="mt-2 grid gap-1 text-xs leading-5 text-amber-900/80 sm:grid-cols-2">
                  {missingDocuments.map((requirement) => (
                    <li key={requirement.label}>• {requirement.label}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between lg:col-span-2">
              <button type="button" onClick={() => setStep("details")} className={ghostBtn}>
                Torna ai dati
              </button>
              <div className="flex w-full flex-col items-stretch gap-2 sm:items-end">
                <button
                  type="button"
                  disabled={busy || !verified || !contactEmail.includes("@") || missingDocuments.length > 0}
                  onClick={submitRequest}
                  className={primaryBtn}
                >
                  {busy ? "Apertura pagamento…" : `Paga ${priceLabel || "6,50 €"} e invia`}
                </button>
                <PaymentCheckoutNotice amountLabel={priceLabel || "6,50 €"} />
              </div>
            </div>
          </div>
        )}

        {step === "status" && (
          <section className={`${panelCls} md:p-10`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Stato attuale</p>
                <h2 className="display-type mt-2 text-2xl">{STATUS_LABELS[status] || status}</h2>
                <p className="mt-2 text-sm text-[var(--ink)]/55">
                  La pagina controlla automaticamente gli aggiornamenti ogni 15 secondi.
                </p>
              </div>
              <span className="flex h-16 w-16 items-center justify-center border border-[var(--ink)]/15 text-2xl">✓</span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="border border-[var(--ink)]/12 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/45">Numero pratica</p>
                <p className="mt-1 text-sm font-semibold">{requestNumber || "In assegnazione"}</p>
              </div>
              <div className="border border-[var(--ink)]/12 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/45">Documenti</p>
                <p className="mt-1 text-sm font-semibold">{documents.length} allegati</p>
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void refresh().catch((cause) =>
                  setError(cause instanceof Error ? cause.message : "Aggiornamento non riuscito"),
                )
              }
              className={`mt-6 ${ghostBtn}`}
            >
              Aggiorna ora
            </button>
          </section>
        )}
          </div>
          {guest && <PublicTrustPanel priceLabel={priceLabel} />}
        </div>
      </div>
    </div>
  );
}
