/**
 * Callers: area-clienti contratti-energia|telefonia pages (+ other gestiio workspaces).
 * API: GET/POST /api/client-area/gestiio/practices; GET catalog for gestori/tipi.
 * Schema: ClientAreaField form → GestiiO practice → segnalazione Contratto* AG00062.
 * User: "contratti telefonia e luce e gas(energia) in area clienti dovrebbero seguire il workflow per le segnalazioni presente in gestiio su operatore AG00062"
 */
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  getClientPortalToken,
  readClientPortalTokenPayload,
} from "@/lib/client-portal-auth";
import type { ClientAreaField } from "@/lib/client-area";
import PaymentCheckoutNotice from "@/components/compliance/PaymentCheckoutNotice";

type PracticeRow = {
  uuid: string;
  service_slug: string;
  status: string;
  payment_status: string;
  created_at?: string | null;
};

type CatalogOption = { value: string; label: string };

type AttachmentPayload = {
  filename: string;
  mime: string;
  content_base64: string;
};

type Props = {
  serviceSlug: string;
  title: string;
  subtitle: string;
  fields?: ClientAreaField[];
  readOnly?: boolean;
  paymentRequired?: boolean;
  amountCents?: number;
  /** Prefill campi form (es. offerta scelta dalla simulazione). */
  initialValues?: Record<string, string>;
};

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

async function fileToAttachment(file: File): Promise<AttachmentPayload> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return {
    filename: file.name,
    mime: file.type || "application/octet-stream",
    content_base64: btoa(binary),
  };
}

export default function GestiioPracticeWorkspace({
  serviceSlug,
  title,
  subtitle,
  fields = [],
  readOnly = false,
  paymentRequired = false,
  amountCents = 1500,
  initialValues,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const isSegnalazione =
    serviceSlug === "contratti-energia" || serviceSlug === "contratti-telefonia";
  const [practices, setPractices] = useState<PracticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(fields.map((f) => [f.id, ""])),
    ...(initialValues || {}),
  }));
  const [fieldOptions, setFieldOptions] = useState<Record<string, CatalogOption[]>>({});
  const [attachments, setAttachments] = useState<AttachmentPayload[]>([]);
  const checkoutHandled = useRef(false);

  useEffect(() => {
    if (!initialValues) return;
    setForm((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  useEffect(() => {
    if (!isSegnalazione) return;
    const kind =
      serviceSlug === "contratti-energia" ? "energia-gestori" : "telefonia-tipi";
    const fieldId = serviceSlug === "contratti-energia" ? "gestore_id" : "tipo_contratto_id";
    void (async () => {
      try {
        const token = getClientPortalToken();
        const res = await fetch(
          `/api/client-area/gestiio/catalog?kind=${encodeURIComponent(kind)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: "no-store",
          },
        );
        const json = await res.json();
        if (!res.ok) {
          // Catalogo assente in GestiiO: non bloccare il form segnalazione.
          setFieldOptions((prev) => ({ ...prev, [fieldId]: [] }));
          return;
        }
        const options = (json.options || []) as CatalogOption[];
        setFieldOptions((prev) => ({ ...prev, [fieldId]: options }));
      } catch {
        setFieldOptions((prev) => ({ ...prev, [fieldId]: [] }));
      }
    })();
  }, [isSegnalazione, serviceSlug]);

  async function loadPractices() {
    setLoading(true);
    setError("");
    try {
      const token = getClientPortalToken();
      const res = await fetch(
        `/api/client-area/gestiio/practices?service_slug=${encodeURIComponent(serviceSlug)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Impossibile caricare le pratiche");
      setPractices(json.practices || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di caricamento");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPractices();
  }, [serviceSlug]);

  useEffect(() => {
    if (typeof window === "undefined" || checkoutHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const state = params.get("checkout");
    const sessionId = params.get("session_id");
    const uuid = params.get("uuid");
    if (!state) return;
    checkoutHandled.current = true;

    if (state === "cancel") {
      setError("Pagamento annullato. Puoi riprovare quando vuoi.");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (state === "success" && sessionId && uuid) {
      void (async () => {
        try {
          const token = getClientPortalToken();
          const res = await fetch("/api/client-area/gestiio/practices/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ sessionId, uuid }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Verifica pagamento fallita");
          setOk("Pagamento confermato. La pratica è in lavorazione.");
          await loadPractices();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Verifica pagamento non riuscita");
        } finally {
          window.history.replaceState({}, "", window.location.pathname);
        }
      })();
    }
  }, [serviceSlug]);

  async function onFilesChange(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      setAttachments([]);
      return;
    }
    const files = Array.from(fileList).slice(0, MAX_ATTACHMENTS);
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setError(`Il file ${file.name} supera i 5 MB.`);
        return;
      }
    }
    setError("");
    const encoded = await Promise.all(files.map(fileToAttachment));
    setAttachments(encoded);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (readOnly) return;
    setSubmitting(true);
    setError("");
    setOk("");
    try {
      const token = getClientPortalToken();
      const payloadToken = readClientPortalTokenPayload();
      const holderName =
        [form.nome, form.cognome].filter(Boolean).join(" ").trim() ||
        form.holder_name ||
        "";
      const payload: Record<string, unknown> = {
        ...form,
        ...(attachments.length > 0 ? { attachments } : {}),
      };
      const res = await fetch("/api/client-area/gestiio/practices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          service_slug: serviceSlug,
          service_type: form.service_type || serviceSlug,
          customer_name:
            holderName || payloadToken?.fullName || payloadToken?.username || "",
          customer_email: form.email || undefined,
          customer_phone: form.phone || form.contact_phone || undefined,
          payload,
          payment_required: paymentRequired,
          amount_cents: amountCents,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Creazione pratica fallita");
      setOk(
        isSegnalazione
          ? "Segnalazione inviata. In GestiiO risulta come contratto segnalato: ti ricontattiamo per completare."
          : "Pratica aperta. La trovi nello storico qui sotto.",
      );
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl as string;
        return;
      }
      setForm(Object.fromEntries(fields.map((f) => [f.id, ""])));
      setAttachments([]);
      await loadPractices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di invio");
    } finally {
      setSubmitting(false);
    }
  }

  function optionsFor(field: ClientAreaField): CatalogOption[] {
    if (fieldOptions[field.id]?.length) return fieldOptions[field.id]!;
    return field.options || [];
  }

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40"
        >
          Area clienti · {isSegnalazione ? "Segnalazione contratto" : "Gestiio"}
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]"
        >
          {title}
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">{subtitle}</p>
      </section>

      <section className="grid gap-px bg-[var(--ink)]/10 lg:grid-cols-2">
        <div className="bg-[var(--paper)] p-5 md:p-7">
          {readOnly ? (
            <p className="text-sm text-[var(--ink)]/55">
              Questa sezione e solo consultazione. Per nuove pratiche usa i moduli attivi dall&apos;area clienti.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
                {isSegnalazione ? "Nuova segnalazione" : "Nuova pratica"}
              </p>
              {fields.map((field) => {
                const selectOptions = optionsFor(field);
                const isCatalogSelect =
                  field.type === "select" &&
                  (field.id === "gestore_id" || field.id === "tipo_contratto_id");
                if (isCatalogSelect && selectOptions.length === 0) {
                  return null;
                }
                return (
                  <label key={field.id} className="block">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                      {field.label}
                    </span>
                    {field.type === "select" ? (
                      <select
                        required={field.required}
                        value={form[field.id] || ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
                      >
                        <option value="">{field.placeholder || "Scegli"}</option>
                        {selectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        required={field.required}
                        value={form[field.id] || ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
                      />
                    )}
                  </label>
                );
              })}
              {isSegnalazione ? (
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                    Allegati (bolletta / documento)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                    onChange={(e) => void onFilesChange(e.target.files)}
                    className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none file:mr-3 file:border-0 file:bg-[var(--ink)] file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-white"
                  />
                  <span className="mt-1.5 block text-[11px] text-[var(--ink)]/45">
                    Consigliato: fino a {MAX_ATTACHMENTS} file, max 5 MB ciascuno.
                    {attachments.length > 0
                      ? ` · ${attachments.length} file pronti`
                      : ""}
                  </span>
                </label>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#5E0ED7] disabled:opacity-60"
              >
                {submitting
                  ? "Invio…"
                  : paymentRequired
                    ? `Apri e paga ${(amountCents / 100).toFixed(2).replace(".", ",")} €`
                    : isSegnalazione
                      ? "Invia segnalazione"
                      : "Apri pratica"}
              </button>
              {paymentRequired ? (
                <PaymentCheckoutNotice
                  className="mt-3"
                  amountLabel={`${(amountCents / 100).toFixed(2).replace(".", ",")} €`}
                />
              ) : null}
            </form>
          )}
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          {ok && <p className="mt-4 text-sm text-[#5E0ED7]">{ok}</p>}
        </div>

        <div className="bg-[var(--paper)] p-5 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
            Le tue pratiche
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--ink)]/45">Caricamento…</p>
          ) : practices.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink)]/45">Nessuna pratica ancora.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {practices.map((p) => (
                <li key={p.uuid} className="border border-[var(--ink)]/12 px-3 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em]">{p.status}</p>
                  <p className="mt-1 text-sm text-[var(--ink)]/70">
                    {p.uuid.slice(0, 8)}… · pagamento {p.payment_status}
                  </p>
                  {p.created_at && (
                    <p className="mt-1 text-[11px] text-[var(--ink)]/40">
                      {new Date(p.created_at).toLocaleString("it-IT")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
