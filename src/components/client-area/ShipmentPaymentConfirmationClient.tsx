"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/shipment-payment";

type ShipmentDraft = {
  customerName: string;
  email: string;
  phone: string;
  billingType: string;
  billingCompanyName: string;
  billingVatNumber: string;
  billingTaxCode: string;
  billingRecipientCode: string;
  billingCertifiedEmail: string;
  billingAddress: string;
  billingZIPCode: string;
  billingCity: string;
  billingProvince: string;
  serviceCode: string;
  pickupAddress: string;
  pickupZIPCode: string;
  pickupCity: string;
  pickupProvince: string;
  destinationCompanyName: string;
  destinationAddress: string;
  destinationZIPCode: string;
  destinationCity: string;
  destinationProvince: string;
  destinationCountry: string;
  pudoId: string;
  parcelCount: number;
  parcelLengthCM: number;
  parcelHeightCM: number;
  parcelDepthCM: number;
  weightKG: number;
  notes: string;
};

type FinalizeResult = {
  message?: string;
  trackingCode?: string;
  parcelId?: string;
  labelPdfBase64?: string;
  orm?: {
    created?: boolean;
    message?: string;
    collectionDate?: string;
    collectionTime?: string;
  };
  manifest?: {
    created?: boolean;
    message?: string;
  };
  payment?: {
    amountCents?: number;
    currency?: string;
    sessionId?: string;
    priceLabel?: string;
    invoicePdf?: string;
    hostedInvoiceUrl?: string;
  };
};

export default function ShipmentPaymentConfirmationClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sto verificando il pagamento e finalizzando la spedizione...");
  const [result, setResult] = useState<FinalizeResult | null>(null);
  const [pickupAlertOpen, setPickupAlertOpen] = useState(false);

  const labelHref = useMemo(() => {
    if (!result?.labelPdfBase64) return "";
    return `data:application/pdf;base64,${result.labelPdfBase64}`;
  }, [result?.labelPdfBase64]);

  const pickupDateLabel = useMemo(() => {
    const value = result?.orm?.collectionDate;
    if (!value) return "";

    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }, [result?.orm?.collectionDate]);

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

        const draftRaw = window.sessionStorage.getItem(SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY);
        if (!draftRaw) {
          throw new Error("Dati spedizione non trovati. Riprova dalla pagina spedizioni.");
        }

        const draft = JSON.parse(draftRaw) as ShipmentDraft;
        const response = await fetch("/api/client-area/spedizioni/brt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            stripeSessionId: sessionId,
          }),
        });

        const payload = (await response.json()) as FinalizeResult;
        if (!response.ok) {
          throw new Error(
            payload.message || "Pagamento confermato, ma la spedizione non è stata finalizzata.",
          );
        }

        window.sessionStorage.removeItem(SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY);

        if (!active) return;
        setResult(payload);
        setStatus("success");
        setMessage(payload.message || "Pagamento confermato e spedizione creata.");
        setPickupAlertOpen(true);
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Errore durante la conferma del pagamento e della spedizione.",
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
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Pagamento in verifica
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Sto finalizzando la spedizione dopo il checkout.
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
          Il pagamento c&apos;&egrave;, ma devo controllare la spedizione.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/area-clienti/spedizioni"
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Torna alla pagina spedizioni
          </Link>
          <Link
            href="/area-clienti/spedizioni/storico"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Apri lo storico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pickupAlertOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Avviso ritiro merce
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">
              {result?.orm?.created
                ? "Ritiro automatico programmato"
                : "Consegna il pacco a un BRT | Fermopoint"}
            </h3>
            {result?.orm?.created ? (
              <>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Il corriere BRT è stato programmato per il ritiro all&apos;indirizzo indicato nel
                  form.
                </p>
                <div className="mt-4 rounded-3xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
                  <p>
                    Data ritiro: <strong>{pickupDateLabel || result?.orm?.collectionDate || "n/d"}</strong>
                  </p>
                  <p className="mt-1">
                    Ora ritiro: <strong>{result?.orm?.collectionTime || "n/d"}</strong>
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Prepara il collo e tienilo disponibile. Se il ritiro non andasse a buon fine,
                  porta il pacco in un <strong>BRT | Fermopoint</strong> per far partire la
                  spedizione.
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Per questa spedizione non risulta un ritiro automatico confermato.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Porta il pacco, insieme all&apos;etichetta BRT, in un <strong>BRT | Fermopoint</strong>{" "}
                  per affidarlo al circuito e farlo partire.
                </p>
              </>
            )}
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {result?.orm?.message ||
                "Usa questo avviso come promemoria operativo per la consegna della merce."}
            </p>
            <button
              type="button"
              onClick={() => setPickupAlertOpen(false)}
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ho capito
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Pagamento confermato
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
          La spedizione è stata creata correttamente.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tracking
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {result?.trackingCode || "n/d"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Parcel ID
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {result?.parcelId || "n/d"}
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
              {result?.payment?.priceLabel || "n/d"}
            </p>
          </div>
        </div>

        <div
          className={`mt-5 rounded-3xl border p-4 ${
            result?.orm?.created
              ? "border-cyan-100 bg-cyan-50"
              : "border-amber-100 bg-amber-50"
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
              result?.orm?.created ? "text-cyan-700" : "text-amber-700"
            }`}
          >
            Ritiro merce
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {result?.orm?.created
              ? `Ritiro previsto per il ${pickupDateLabel || result?.orm?.collectionDate || "giorno programmato"} alle ${result?.orm?.collectionTime || "ora programmata"}.`
              : "Se non attendi il ritiro, porta il collo in un BRT | Fermopoint per far partire la spedizione."}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {result?.orm?.message ||
              "Non ho ricevuto un dettaglio aggiuntivo sul ritiro automatico."}
          </p>
        </div>

        <div
          className={`mt-5 rounded-3xl border p-4 ${
            result?.manifest?.created
              ? "border-emerald-100 bg-emerald-50"
              : "border-amber-100 bg-amber-50"
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
              result?.manifest?.created ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            Manifest driver
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {result?.manifest?.created
              ? "Il manifest BRT per il driver è stato creato insieme all'etichetta."
              : "La spedizione è pronta, ma il manifest va ancora controllato."}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {result?.manifest?.message ||
              "Non ho ricevuto un dettaglio aggiuntivo dal servizio BRT."}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {labelHref ? (
            <a
              href={labelHref}
              download={`etichetta-brt-${result?.trackingCode || "spedizione"}.pdf`}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Scarica etichetta PDF
            </a>
          ) : null}
          <Link
            href="/area-clienti/spedizioni"
            className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-900 transition hover:border-cyan-300 hover:bg-cyan-100"
          >
            Cerca un BRT | Fermopoint
          </Link>
          <Link
            href="/area-clienti/spedizioni/storico"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Vai allo storico spedizioni
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
          <Link
            href="/area-clienti/spedizioni"
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Crea un&apos;altra spedizione
          </Link>
        </div>
      </div>
    </div>
  );
}
