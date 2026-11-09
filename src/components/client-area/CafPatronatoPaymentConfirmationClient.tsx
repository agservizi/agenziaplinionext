"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getClientPortalToken } from "@/lib/client-portal-auth";
import { CAF_PATRONATO_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/caf-patronato-payment";

type FinalizeResult = {
  message?: string;
  requestId?: number;
  serviceLabel?: string;
  payment?: {
    amountCents?: number;
    currency?: string;
    sessionId?: string;
    priceLabel?: string;
    invoicePdf?: string;
    hostedInvoiceUrl?: string;
  };
};

export default function CafPatronatoPaymentConfirmationClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(
    "Sto verificando il pagamento e sto inviando la pratica al team...",
  );
  const [result, setResult] = useState<FinalizeResult | null>(null);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          throw new Error("Sessione pagamento non trovata.");
        }

        if (typeof window === "undefined") {
          throw new Error("Conferma pagamento non disponibile in questo ambiente.");
        }

        const draftToken = window.sessionStorage.getItem(CAF_PATRONATO_PAYMENT_DRAFT_STORAGE_KEY);
        if (!draftToken) {
          throw new Error("Dati pratica non trovati. Riprova dal modulo CAF/Patronato.");
        }

        const response = await fetch("/api/client-area/caf-patronato/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftToken,
            stripeSessionId: sessionId,
            token: getClientPortalToken(),
          }),
        });
        const payload = (await response.json()) as FinalizeResult;
        if (!response.ok) {
          throw new Error(payload.message || "Pagamento confermato, ma la pratica non è stata finalizzata.");
        }

        window.sessionStorage.removeItem(CAF_PATRONATO_PAYMENT_DRAFT_STORAGE_KEY);

        if (!active) return;
        setResult(payload);
        setStatus("success");
        setMessage(payload.message || "Pagamento confermato e pratica inviata.");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Errore durante la conferma del pagamento della pratica.",
        );
      }
    }

    void run();
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
          Sto finalizzando la pratica dopo il checkout.
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
          Il pagamento c&apos;è, ma devo controllare la pratica.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/area-clienti/caf-patronato"
            className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Torna all'area CAF e Patronato
          </Link>
          <Link
            href="/area-clienti/caf-patronato/storico"
            className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/70 transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Apri lo storico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5E0ED7]">
        Pagamento confermato
      </p>
      <h2 className="display-type mt-3 text-3xl text-[var(--ink)]">
        La pratica è stata inviata correttamente.
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">{message}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
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
            {result?.payment?.priceLabel || result?.serviceLabel || "n/d"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/area-clienti/caf-patronato/storico"
          className="inline-flex border border-[var(--ink)]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
        >
          Vai allo storico pratiche
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
  );
}
