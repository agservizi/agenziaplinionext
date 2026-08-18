"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getClientPortalToken } from "@/lib/client-portal-auth";
import DatePicker from "@/components/ui/DatePicker";

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
      <span className="mb-1.5 block text-xs font-medium text-slate-400">
        {label}{required && <span className="text-cyan-400"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-[0.9rem] bg-white/[0.045] px-4 text-sm text-white outline-none ring-1 ring-inset ring-white/[0.09] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-slate-700 hover:bg-white/[0.06] hover:ring-white/[0.14] focus:bg-white/[0.065] focus:ring-cyan-300/35"
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
    <fieldset className="rounded-[1.25rem] bg-black/10 p-5 ring-1 ring-inset ring-white/[0.07]">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">{title}</legend>
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
      <div className="rounded-[1.75rem] bg-white/[0.045] p-1.5 ring-1 ring-white/[0.08]">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-[#0a1726] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="mb-6 flex items-end justify-between border-b border-white/[0.07] pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Costo del servizio</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{priceLabel || "—"}</p>
            </div>
            <span className="mb-1 rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-500 ring-1 ring-white/[0.07]">IVA inclusa</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/80">Prima di iniziare</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Tieni a portata di mano</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
            {["L’avviso SEND ricevuto", "Un documento d’identità valido", "Il codice fiscale", "Eventuale delega o visura"].map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-[10px] font-bold text-cyan-300">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-white/[0.045] p-1.5 ring-1 ring-white/[0.08]">
        <div className="divide-y divide-white/[0.07] rounded-[calc(1.75rem-0.375rem)] bg-[#0a1726] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {[
            { type: "lock" as const, title: "Dati protetti", text: "Trasmissione cifrata e chiavi custodite esclusivamente sul server." },
            { type: "file" as const, title: "Pratica tracciata", text: "Ogni richiesta riceve un identificativo e uno stato verificabile." },
            { type: "support" as const, title: "Assistenza reale", text: "La pratica viene controllata da un operatore AG SERVIZI." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/[0.08] text-cyan-300 ring-1 ring-cyan-300/10">
                <TrustIcon type={item.type} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="px-2 text-center text-[11px] leading-5 text-slate-600">
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
      <div className="flex min-h-[65vh] items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-cyan-500/25 border-t-cyan-400" />
          <p className="mt-4 text-sm text-slate-500">Prepariamo la tua richiesta SEND…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-full bg-slate-950 px-5 pb-8 text-white md:px-10 md:pb-10 ${
        guest ? "pt-24 md:pt-28" : "pt-8 md:pt-10"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className={`mb-10 ${guest ? "border-b border-white/[0.08] pb-10 md:pb-12" : ""}`}>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-cyan-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 ring-1 ring-cyan-300/15">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Sportello digitale SEND
              </p>
              <span className="text-xs text-slate-600">Servizio gestito da AG SERVIZI</span>
            </div>
            <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-white md:text-6xl">
                  La tua notifica,
                  <span className="block text-slate-400">seguita fino all’esito.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  Inserisci i dati dell’avviso, allega i documenti richiesti e invia la pratica in modo protetto.
                  Un operatore verifica ogni passaggio.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.035] px-4 py-3 ring-1 ring-white/[0.07]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <TrustIcon type="lock" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Connessione protetta</p>
                  <p className="mt-0.5 text-[10px] text-slate-600">Dati cifrati in transito</p>
                </div>
              </div>
            </div>
            {guest && (
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-2"><span className="text-cyan-300">✓</span>Nessuna registrazione</span>
                <span className="flex items-center gap-2"><span className="text-cyan-300">✓</span>Bozza salvata</span>
                <span className="flex items-center gap-2"><span className="text-cyan-300">✓</span>Stato aggiornato</span>
              </div>
            )}
          </div>
          {uuid && (
            <div className="mt-6 inline-flex rounded-xl bg-white/[0.035] px-4 py-3 ring-1 ring-white/[0.08]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">Pratica</p>
              <p className="ml-3 text-sm font-semibold text-cyan-300">{requestNumber || uuid.slice(0, 8)}</p>
            </div>
          )}
        </div>

        <ol className="mb-8 grid grid-cols-3 gap-2 rounded-[1.35rem] bg-white/[0.035] p-1.5 ring-1 ring-white/[0.07]" aria-label="Avanzamento pratica">
          {["Dati", "Documenti", "Stato"].map((label, index) => (
            <li key={label} className={`rounded-2xl px-3 py-3.5 text-center text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              index <= stepIndex ? "bg-[#12304a] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "text-slate-600"
            }`}>
              <span className="mr-2 text-[10px] opacity-60">0{index + 1}</span>{label}
            </li>
          ))}
        </ol>

        <div className={guest ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]" : ""}>
          <div className="min-w-0">
        {(message || error) && (
          <div role={error ? "alert" : "status"} className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            error ? "border-red-500/25 bg-red-500/8 text-red-300" : "border-emerald-500/20 bg-emerald-500/8 text-emerald-300"
          }`}>
            {error || message}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={createDraft} className="space-y-6">
            <section className="rounded-[1.75rem] bg-white/[0.035] p-1.5 ring-1 ring-white/[0.08]">
              <div className="rounded-[calc(1.75rem-0.375rem)] bg-[#0a1726] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-7">
              <h2 className="text-base font-semibold">Chi presenta la richiesta?</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {APPLICANTS.map((item) => (
                  <label key={item.value} className={`cursor-pointer rounded-2xl p-4 ring-1 ring-inset transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    applicantType === item.value ? "bg-cyan-300/[0.09] ring-cyan-300/35" : "bg-white/[0.025] ring-white/[0.08] hover:-translate-y-0.5 hover:bg-white/[0.045] hover:ring-white/[0.14]"
                  }`}>
                    <input className="sr-only" type="radio" name="applicant" value={item.value} checked={applicantType === item.value} onChange={() => setApplicantType(item.value)} />
                    <span className="block text-sm font-semibold text-slate-100">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{item.hint}</span>
                  </label>
                ))}
              </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] bg-white/[0.035] p-1.5 ring-1 ring-white/[0.08]">
              <div className="rounded-[calc(1.75rem-0.375rem)] bg-[#0a1726] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-7">
              <h2 className="mb-5 text-base font-semibold">Dati dell’avviso</h2>
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
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">Priorità</span>
                  <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-12 w-full rounded-[0.9rem] bg-[#101d2c] px-4 text-sm text-white outline-none ring-1 ring-inset ring-white/[0.09] focus:ring-cyan-300/35">
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
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">Note iniziali</span>
                  <textarea value={notes} maxLength={5000} onChange={(event) => setNotes(event.target.value)} className="min-h-24 w-full rounded-[0.9rem] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none ring-1 ring-inset ring-white/[0.09] focus:ring-cyan-300/35" />
                </label>
              </div>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.75rem] bg-[#0a1726] p-5 ring-1 ring-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-7">
              <h2 className="text-base font-semibold">Soggetti della pratica</h2>
              {(applicantType === "destinatario" || applicantType === "delegato") && <PersonFields title="Destinatario" value={destinatario} onChange={setDestinatario} />}
              {(applicantType === "delegato" || applicantType === "delegato_impresa") && <PersonFields title="Delegato" value={delegato} onChange={setDelegato} />}
              {(applicantType === "impresa" || applicantType === "delegato_impresa") && (
                <fieldset className="rounded-[1.25rem] bg-black/10 p-5 ring-1 ring-inset ring-white/[0.07]">
                  <legend className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">Impresa</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Field label="Ragione sociale" value={impresa.business_name} required onChange={(business_name) => setImpresa({ ...impresa, business_name })} /></div>
                    <Field label="Partita IVA" value={impresa.vat_number} required onChange={(vat_number) => setImpresa({ ...impresa, vat_number })} />
                    <Field label="Codice fiscale" value={impresa.tax_code} required onChange={(tax_code) => setImpresa({ ...impresa, tax_code })} />
                  </div>
                </fieldset>
              )}
              {applicantType === "impresa" && <PersonFields title="Rappresentante" value={rappresentante} onChange={setRappresentante} />}
            </section>

            <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#0a1726] p-5 text-sm leading-6 text-slate-400 ring-1 ring-white/[0.08]">
              <input type="checkbox" required checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400" />
              <span>Confermo di aver letto l’informativa privacy e autorizzo il trattamento dei dati necessari alla gestione della pratica.</span>
            </label>

            <div className="flex justify-end">
              <button disabled={busy} className="group inline-flex items-center gap-3 rounded-full bg-cyan-300 py-2 pl-6 pr-2 text-sm font-bold text-[#06121f] shadow-[0_16px_50px_rgba(103,232,249,0.15)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-cyan-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-50">
                {busy ? "Creazione in corso…" : "Crea bozza e continua"}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#06121f]/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
            </div>
          </form>
        )}

        {step === "documents" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
            <form onSubmit={uploadDocument} className="rounded-2xl border border-white/7 bg-[#0d1420] p-5 md:p-6">
              <h2 className="text-base font-semibold">Allega un documento</h2>
              <p className="mt-1 text-sm text-slate-500">PDF, JPG, PNG o WEBP, massimo 20 MB per file.</p>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">Tipo di documento</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#101827] px-3.5 text-sm text-white outline-none">
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="mt-4 block rounded-xl border border-dashed border-white/15 bg-white/[0.025] p-5 text-center transition hover:border-cyan-500/40">
                <span className="block text-sm font-medium text-slate-300">{file?.name || "Scegli il file"}</span>
                <span className="mt-1 block text-xs text-slate-600">Clicca per sfogliare i documenti</span>
                <input id="send-document" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="sr-only" />
              </label>
              <button disabled={busy || !file} className="mt-5 w-full rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-40">
                {busy ? "Caricamento…" : "Carica documento"}
              </button>
            </form>

            <section className="rounded-2xl border border-white/7 bg-[#0d1420] p-5 md:p-6">
              <h2 className="text-base font-semibold">Documenti caricati</h2>
              {documents.length === 0 ? (
                <p className="mt-6 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-6 text-center text-sm text-slate-600">Nessun documento caricato.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {documents.map((document, index) => (
                    <li key={`${document.category}-${document.id || index}`} className="flex items-center gap-3 rounded-xl border border-white/7 bg-white/[0.025] px-3.5 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">✓</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-300">{document.name}</span>
                        <span className="block text-[10px] uppercase tracking-[0.12em] text-slate-600">{document.category.replaceAll("_", " ")}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <label className="flex items-start gap-3 rounded-2xl border border-white/7 bg-[#0d1420] p-5 text-sm leading-6 text-slate-400 lg:col-span-2">
              <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} className="mt-1 h-4 w-4 accent-purple-500" />
              <span>Confermo che identità, dati e documenti inseriti sono stati verificati e corrispondono alla notifica.</span>
            </label>

            {missingDocuments.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5 lg:col-span-2">
                <p className="text-sm font-semibold text-amber-300">Documenti ancora necessari</p>
                <ul className="mt-2 grid gap-1 text-xs leading-5 text-amber-200/70 sm:grid-cols-2">
                  {missingDocuments.map((requirement) => (
                    <li key={requirement.label}>• {requirement.label}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between lg:col-span-2">
              <button type="button" onClick={() => setStep("details")} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5">Torna ai dati</button>
              <button type="button" disabled={busy || !verified || !contactEmail.includes("@") || missingDocuments.length > 0} onClick={submitRequest} className="rounded-full bg-cyan-300 px-7 py-3 text-sm font-bold text-[#06121f] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-cyan-200 disabled:opacity-40">
                {busy ? "Apertura pagamento…" : `Paga ${priceLabel || "6,50 €"} e invia`}
              </button>
            </div>
          </div>
        )}

        {step === "status" && (
          <section className="rounded-3xl border border-purple-500/20 bg-linear-to-br from-purple-500/10 via-[#0d1420] to-cyan-500/5 p-6 md:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-400">Stato attuale</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{STATUS_LABELS[status] || status}</h2>
                <p className="mt-2 text-sm text-slate-400">La pagina controlla automaticamente gli aggiornamenti ogni 15 secondi.</p>
              </div>
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-2xl text-cyan-300">✓</span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/7 bg-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">Numero pratica</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{requestNumber || "In assegnazione"}</p>
              </div>
              <div className="rounded-xl border border-white/7 bg-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">Documenti</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{documents.length} allegati</p>
              </div>
            </div>
            <button type="button" disabled={busy} onClick={() => void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "Aggiornamento non riuscito"))} className="mt-6 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50">
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
