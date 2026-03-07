"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
          body: JSON.stringify({ draftToken, stripeSessionId: sessionId }),
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
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Pagamento in verifica
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Sto finalizzando la pratica dopo il checkout.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[32px] border border-red-100 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
          Finalizzazione non riuscita
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Il pagamento c&apos;è, ma devo controllare la pratica.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/area-clienti/caf-patronato"
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Torna all'area CAF e Patronato
          </Link>
          <Link
            href="/area-clienti/caf-patronato/storico"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Apri lo storico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        Pagamento confermato
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-950">
        La pratica è stata inviata correttamente.
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pratica
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {result?.requestId ? `#${result.requestId}` : "n/d"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pagato
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {typeof result?.payment?.amountCents === "number"
              ? `${(result.payment.amountCents / 100).toFixed(2).replace(".", ",")} ${String(
                  result.payment.currency || "eur",
                ).toUpperCase()}`
              : "n/d"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tariffa
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {result?.payment?.priceLabel || result?.serviceLabel || "n/d"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/area-clienti/caf-patronato/storico"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Vai allo storico pratiche
        </Link>
        {result?.payment?.invoicePdf ? (
          <a
            href={result.payment.invoicePdf}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Apri invoice PDF Stripe
          </a>
        ) : null}
        {result?.payment?.hostedInvoiceUrl ? (
          <a
            href={result.payment.hostedInvoiceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Apri fattura hosted
          </a>
        ) : null}
      </div>
    </div>
  );
}
