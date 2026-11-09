"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VISURA_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/visure-payment";

type VisuraDraft = {
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  token?: string;
  resolvedServiceHash: string;
  resolvedServiceLabel: string;
  formData: Record<string, unknown>;
};

type FinalizeResult = {
  message?: string;
  requestId?: number;
  provider?: string;
  providerService?: string;
  providerStatus?: string;
  providerRequestId?: string;
  documentUrl?: string;
  documentBase64?: string;
  summary?: Record<string, unknown>;
  payment?: {
    amountCents?: number;
    currency?: string;
    sessionId?: string;
    priceLabel?: string;
    invoicePdf?: string;
    hostedInvoiceUrl?: string;
  };
};

function formatProviderStatus(status?: string) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "awaiting_manual_fulfillment") return "Presa in carico";
  if (normalized === "waiting-documents") return "In attesa documenti";
  if (normalized === "completed") return "Evasa";
  if (normalized === "processing") return "In lavorazione";
  return status || "processing";
}

export default function VisuraPaymentConfirmationClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sto verificando il pagamento e finalizzando la visura...");
  const [result, setResult] = useState<FinalizeResult | null>(null);

  const documentHref = useMemo(() => {
    if (!result?.documentBase64) return "";
    return `data:application/pdf;base64,${result.documentBase64}`;
  }, [result?.documentBase64]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          throw new Error("Sessione pagamento non trovata.");
        }

        if (typeof window === "undefined") {
          throw new Error("Conferma pagamento non disponibile in questo ambiente.");
        }

        const draftRaw = window.sessionStorage.getItem(VISURA_PAYMENT_DRAFT_STORAGE_KEY);
        if (!draftRaw) {
          throw new Error("Dati visura non trovati. Riprova dalla pagina visure.");
        }

        const draft = JSON.parse(draftRaw) as VisuraDraft;
        const response = await fetch("/api/client-area/visure/openapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            stripeSessionId: sessionId,
          }),
        });

        const payload = (await response.json()) as FinalizeResult;
        if (!response.ok) {
          throw new Error(payload.message || "Pagamento confermato, ma la visura non è stata finalizzata.");
        }

        window.sessionStorage.removeItem(VISURA_PAYMENT_DRAFT_STORAGE_KEY);

        if (!active) return;
        setResult(payload);
        setStatus("success");
        setMessage(payload.message || "Pagamento confermato e richiesta visura creata.");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Errore durante la conferma del pagamento e della visura.",
        );
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6 md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
          Pagamento in verifica
        </p>
        <h2 className="display-type mt-3 text-2xl text-[var(--ink)]">
          Sto finalizzando la richiesta visura dopo il checkout.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">{message}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border border-red-200 bg-[var(--paper)] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
          Finalizzazione non riuscita
        </p>
        <h2 className="display-type mt-3 text-2xl text-[var(--ink)]">
          Il pagamento c&apos;&egrave;, ma devo controllare la richiesta.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/area-clienti/visure"
            className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Torna all'area visure
          </Link>
          <Link
            href="/area-clienti/visure/storico"
            className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/70 transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Apri lo storico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5E0ED7]">
          Pagamento confermato
        </p>
        <h2 className="display-type mt-3 text-3xl text-[var(--ink)]">
          La richiesta visura è stata registrata correttamente.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">{message}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_90%,white)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Pratica
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {result?.requestId ? `#${result.requestId}` : "n/d"}
            </p>
          </div>
          <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_90%,white)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Stato
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {formatProviderStatus(result?.providerStatus)}
            </p>
          </div>
          <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_90%,white)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Pagato
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {typeof result?.payment?.amountCents === "number"
                ? `${(result.payment.amountCents / 100).toFixed(2).replace(".", ",")} ${String(
                    result.payment.currency || "eur",
                  ).toUpperCase()}`
                : "n/d"}
            </p>
          </div>
          <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_90%,white)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Tariffa
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {result?.payment?.priceLabel || "n/d"}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm text-[var(--ink)]/55">
          Servizio: <strong className="text-[var(--ink)]">{result?.providerService || "n/d"}</strong>
          {result?.providerRequestId ? ` • riferimento ${result.providerRequestId}` : ""}
        </p>

        {result?.summary && Object.keys(result.summary).length > 0 ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {Object.entries(result.summary).map(([key, value]) => (
              <div key={key} className="text-sm text-[var(--ink)]/55">
                <strong className="text-[var(--ink)]">{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {result?.documentUrl ? (
            <a
              href={result.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#5E0ED7]"
            >
              Apri documento
            </a>
          ) : null}
          {documentHref ? (
            <a
              href={documentHref}
              download={`visura-${result?.requestId || "richiesta"}.pdf`}
              className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#5E0ED7]"
            >
              Scarica PDF
            </a>
          ) : null}
          <Link
            href="/area-clienti/visure/storico"
            className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Vai allo storico visure
          </Link>
          {result?.payment?.invoicePdf ? (
            <a
              href={result.payment.invoicePdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            >
              Apri invoice PDF Stripe
            </a>
          ) : null}
          {result?.payment?.hostedInvoiceUrl ? (
            <a
              href={result.payment.hostedInvoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            >
              Apri fattura hosted
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
