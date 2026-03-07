"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = {
  message?: string;
  requestId?: number;
  orderId?: number;
  pageCount?: number;
  unitPriceCents?: number;
  amountCents?: number;
  currency?: string;
  pdfUrl?: string;
};

function formatMoney(amountCents?: number, currency?: string) {
  if (typeof amountCents !== "number") return "n/d";
  return `${(amountCents / 100).toFixed(2).replace(".", ",")} ${String(currency || "EUR").toUpperCase()}`;
}

export default function PhotocopyPaymentConfirmationClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sto verificando il pagamento...");
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const sessionId = String(searchParams.get("session_id") || "").trim();
        const orderToken = String(searchParams.get("order_token") || "").trim();

        if (!sessionId || !orderToken) {
          throw new Error("Dati pagamento non validi. Riprova dal modulo fotocopie.");
        }

        const response = await fetch("/api/client-area/fotocopie/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, orderToken }),
        });

        const payload = (await response.json()) as VerifyResult;
        if (!response.ok) {
          throw new Error(payload.message || "Verifica pagamento non riuscita.");
        }

        if (!active) return;
        setResult(payload);
        setStatus("success");
        setMessage(payload.message || "Pagamento confermato: ordine in lavorazione.");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore durante la conferma ordine.");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Pagamento in verifica</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Controllo ordine fotocopie in corso</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[32px] border border-red-100 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Conferma non riuscita</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Devo verificare manualmente il pagamento</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/area-clienti/fotocopie"
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Torna al modulo fotocopie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Pagamento confermato</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-950">Ordine fotocopie registrato correttamente</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pratica</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {result?.requestId ? `#${result.requestId}` : "n/d"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pagine</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{result?.pageCount || "n/d"}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Prezzo pagina</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatMoney(result?.unitPriceCents, result?.currency)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Totale</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatMoney(result?.amountCents, result?.currency)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Il file PDF è stato inviato al backoffice per la stampa. Ritiro previsto in agenzia AG SERVIZI.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {result?.pdfUrl ? (
          <a
            href={result.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Apri PDF caricato
          </a>
        ) : null}
        <Link
          href="/area-clienti/fotocopie"
          className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          Nuovo ordine fotocopie
        </Link>
      </div>
    </div>
  );
}
