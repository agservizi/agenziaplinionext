"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { ClientAreaConfig } from "@/lib/client-area";
import { SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/shipment-payment";

export type BrtShipmentLiveSummary = {
  serviceLabel: string;
  destinationCountry: string;
  parcelCount: number;
  actualWeightKG: number;
  volumetricWeightKG: number;
  taxableWeightKG: number;
  volumeM3: number;
  dimensionsLabel: string;
  pudoSelected: boolean;
  estimatedCostLabel: string;
};

type BrtShipmentFormProps = {
  area: ClientAreaConfig;
  onSummaryChange?: (summary: BrtShipmentLiveSummary) => void;
  onShipmentCreated?: () => void;
};

type ShipmentFormState = {
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
  parcelCount: string;
  parcelLengthCM: string;
  parcelHeightCM: string;
  parcelDepthCM: string;
  weightKG: string;
  notes: string;
};

type ShipmentSubmissionPayload = Omit<
  ShipmentFormState,
  "parcelCount" | "parcelLengthCM" | "parcelHeightCM" | "parcelDepthCM" | "weightKG"
> & {
  parcelCount: number;
  parcelLengthCM: number;
  parcelHeightCM: number;
  parcelDepthCM: number;
  weightKG: number;
};

function buildInitialState(area: ClientAreaConfig): ShipmentFormState {
  return {
    customerName: "",
    email: "",
    phone: "",
    billingType: "privato",
    billingCompanyName: "",
    billingVatNumber: "",
    billingTaxCode: "",
    billingRecipientCode: "",
    billingCertifiedEmail: "",
    billingAddress: "",
    billingZIPCode: "",
    billingCity: "",
    billingProvince: "",
    serviceCode: area.serviceOptions[0]?.value ?? "ritiro-nazionale",
    pickupAddress: "",
    pickupZIPCode: "",
    pickupCity: "",
    pickupProvince: "",
    destinationCompanyName: "",
    destinationAddress: "",
    destinationZIPCode: "",
    destinationCity: "",
    destinationProvince: "",
    destinationCountry: "IT",
    pudoId: "",
    parcelCount: "1",
    parcelLengthCM: "10",
    parcelHeightCM: "10",
    parcelDepthCM: "10",
    weightKG: "1",
    notes: "",
  };
}

export default function BrtShipmentForm({
  area,
  onSummaryChange,
  onShipmentCreated,
}: BrtShipmentFormProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ShipmentFormState>(() => buildInitialState(area));
  const [billingAccordionOpen, setBillingAccordionOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "redirecting" | "error">(
    "idle",
  );
  const [paymentMessage, setPaymentMessage] = useState("");
  const [routingInfo, setRoutingInfo] = useState<{
    arrivalTerminal: string;
    arrivalDepot: string;
    deliveryZone: string;
  } | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [trackingMessage, setTrackingMessage] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<{
    shipmentId: string;
    status: string;
    statusDescription: string;
    events: Array<{ date: string; time: string; description: string; branch: string }>;
  } | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [parcelId, setParcelId] = useState("");
  const [labelPdfBase64, setLabelPdfBase64] = useState("");
  const [pudoStatus, setPudoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pudoMessage, setPudoMessage] = useState("");
  const [pudoPoints, setPudoPoints] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      zipCode: string;
      city: string;
      province: string;
      country: string;
    }>
  >([]);
  const [pudoModalOpen, setPudoModalOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [numericSenderReference, setNumericSenderReference] = useState(0);
  const [alphanumericSenderReference, setAlphanumericSenderReference] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [manifestStatus, setManifestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [manifestMessage, setManifestMessage] = useState("");

  const labelHref = useMemo(() => {
    if (!labelPdfBase64) return "";
    return `data:application/pdf;base64,${labelPdfBase64}`;
  }, [labelPdfBase64]);
  const parcelCount = Number(form.parcelCount) || 0;
  const parcelLengthCM = Number(form.parcelLengthCM) || 0;
  const parcelHeightCM = Number(form.parcelHeightCM) || 0;
  const parcelDepthCM = Number(form.parcelDepthCM) || 0;
  const volumeCM3 = parcelCount * parcelLengthCM * parcelHeightCM * parcelDepthCM;
  const volumeM3 = Number((volumeCM3 / 1_000_000).toFixed(4));
  const volumetricWeightKG = Number((volumeCM3 / 4000).toFixed(2));
  const actualWeightKG = Number(form.weightKG) || 0;
  const taxableWeightKG = Math.max(actualWeightKG, volumetricWeightKG);
  const selectedService = area.serviceOptions.find((option) => option.value === form.serviceCode);
  const selectedPudoPoint = useMemo(
    () => pudoPoints.find((point) => point.id === form.pudoId) || null,
    [form.pudoId, pudoPoints],
  );

  const updateField = <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildSubmissionPayload = (): ShipmentSubmissionPayload => ({
    ...form,
    parcelCount: Number(form.parcelCount),
    parcelLengthCM: Number(form.parcelLengthCM),
    parcelHeightCM: Number(form.parcelHeightCM),
    parcelDepthCM: Number(form.parcelDepthCM),
    weightKG: Number(form.weightKG),
  });

  useEffect(() => {
    const costLabel =
      form.destinationCountry === "IT"
        ? taxableWeightKG <= 3
          ? "7,90 - 9,90 euro"
          : taxableWeightKG <= 10
            ? "9,90 - 14,90 euro"
            : "14,90+ euro"
        : "preventivo dinamico";

    onSummaryChange?.({
      serviceLabel: selectedService?.label || "Spedizione",
      destinationCountry: form.destinationCountry,
      parcelCount,
      actualWeightKG,
      volumetricWeightKG,
      taxableWeightKG,
      volumeM3,
      dimensionsLabel: `${parcelLengthCM || 0} x ${parcelHeightCM || 0} x ${parcelDepthCM || 0} cm`,
      pudoSelected: Boolean(form.pudoId),
      estimatedCostLabel: costLabel,
    });
  }, [
    actualWeightKG,
    area.serviceOptions,
    form.destinationCountry,
    form.pudoId,
    form.serviceCode,
    onSummaryChange,
    parcelCount,
    parcelDepthCM,
    parcelHeightCM,
    parcelLengthCM,
    selectedService?.label,
    taxableWeightKG,
    volumetricWeightKG,
    volumeM3,
  ]);

  useEffect(() => {
    const checkoutState = searchParams.get("shipment_checkout");

    if (checkoutState === "cancel") {
      setPaymentStatus("error");
      setPaymentMessage("Checkout annullato: nessuna spedizione è stata creata.");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  const onSearchPudo = async () => {
    setPudoStatus("loading");
    setPudoMessage("");
    setPudoPoints([]);

    try {
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      const endpoint = isLocalhost
        ? "/api/client-area/spedizioni/brt/pudo"
        : `/api/public/brt-pudo?${new URLSearchParams({
            zipCode: form.destinationZIPCode,
            city: form.destinationCity,
            country: form.destinationCountry,
          }).toString()}`;

      const response = await fetch(
        endpoint,
        isLocalhost
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                zipCode: form.destinationZIPCode,
                city: form.destinationCity,
                country: form.destinationCountry,
              }),
            }
          : {
              method: "GET",
            },
      );

      const payload = (await response.json()) as {
        message?: string;
        points?: Array<{
          id?: string;
          name?: string;
          address?: string;
          zipCode?: string;
          city?: string;
          province?: string;
          country?: string;
        }>;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Ricerca PUDO non disponibile.");
      }

      setPudoStatus("success");
      setPudoMessage(payload.message || "Ricerca completata.");
      const nextPoints = Array.isArray(payload.points)
        ? payload.points.map((item) => ({
            id: String(item?.id || ""),
            name: String(item?.name || ""),
            address: String(item?.address || ""),
            zipCode: String(item?.zipCode || ""),
            city: String(item?.city || ""),
            province: String(item?.province || ""),
            country: String(item?.country || ""),
          }))
        : [];
      setPudoPoints(nextPoints);
      setPudoModalOpen(nextPoints.length > 0);
    } catch (error) {
      setPudoStatus("error");
      setPudoMessage(error instanceof Error ? error.message : "Errore ricerca PUDO.");
      setPudoModalOpen(false);
    }
  };

  const onRefreshTracking = async () => {
    if (!parcelId) return;

    setTrackingStatus("loading");
    setTrackingMessage("");

    try {
      const response = await fetch("/api/client-area/spedizioni/brt/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelId }),
      });

      const payload = (await response.json()) as {
        message?: string;
        shipmentId?: string;
        status?: string;
        statusDescription?: string;
        events?: Array<{ date?: string; time?: string; description?: string; branch?: string }>;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Tracking BRT non disponibile.");
      }

      setTrackingStatus("success");
      setTrackingMessage(payload.message || "Tracking aggiornato.");
      setTrackingInfo({
        shipmentId: String(payload.shipmentId || ""),
        status: String(payload.status || ""),
        statusDescription: String(payload.statusDescription || ""),
        events: Array.isArray(payload.events)
          ? payload.events.map((item) => ({
              date: String(item?.date || ""),
              time: String(item?.time || ""),
              description: String(item?.description || ""),
              branch: String(item?.branch || ""),
            }))
          : [],
      });
    } catch (error) {
      setTrackingStatus("error");
      setTrackingMessage(error instanceof Error ? error.message : "Errore tracking.");
    }
  };

  const onConfirmShipment = async () => {
    if (!numericSenderReference || !alphanumericSenderReference) return;

    setConfirmStatus("loading");
    setConfirmMessage("");

    try {
      const response = await fetch("/api/client-area/spedizioni/brt/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numericSenderReference,
          alphanumericSenderReference,
        }),
      });

      const payload = (await response.json()) as { message?: string; confirmed?: boolean };
      if (!response.ok) {
        throw new Error(payload.message || "Conferma BRT non riuscita.");
      }

      setConfirmStatus("success");
      setConfirmMessage(payload.message || "Spedizione confermata.");
      setConfirmed(Boolean(payload.confirmed));
    } catch (error) {
      setConfirmStatus("error");
      setConfirmMessage(error instanceof Error ? error.message : "Errore conferma BRT.");
    }
  };

  const onDeleteShipment = async () => {
    if (!numericSenderReference || !alphanumericSenderReference) return;

    setDeleteStatus("loading");
    setDeleteMessage("");

    try {
      const response = await fetch("/api/client-area/spedizioni/brt/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numericSenderReference,
          alphanumericSenderReference,
        }),
      });

      const payload = (await response.json()) as { message?: string; deleted?: boolean };
      if (!response.ok) {
        throw new Error(payload.message || "Annullamento BRT non riuscito.");
      }

      setDeleteStatus("success");
      setDeleteMessage(payload.message || "Spedizione annullata.");
      setConfirmed(false);
    } catch (error) {
      setDeleteStatus("error");
      setDeleteMessage(error instanceof Error ? error.message : "Errore annullamento BRT.");
    }
  };

  const onCreateManifest = async () => {
    if (!numericSenderReference || !alphanumericSenderReference) return;

    setManifestStatus("loading");
    setManifestMessage("");

    try {
      const response = await fetch("/api/client-area/spedizioni/brt/manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numericSenderReference,
          alphanumericSenderReference,
        }),
      });

      const payload = (await response.json()) as { message?: string; created?: boolean };
      if (!response.ok) {
        throw new Error(payload.message || "Manifest BRT non disponibile.");
      }

      setManifestStatus("success");
      setManifestMessage(payload.message || "Manifest richiesto a BRT.");
    } catch (error) {
      setManifestStatus("error");
      setManifestMessage(error instanceof Error ? error.message : "Errore manifest BRT.");
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaymentStatus("loading");
    setPaymentMessage("");

    try {
      const shipmentPayload = buildSubmissionPayload();

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY,
          JSON.stringify(shipmentPayload),
        );
      }

      const response = await fetch("/api/client-area/spedizioni/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipmentPayload),
      });

      const payload = (await response.json()) as {
        message?: string;
        url?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.message || "Avvio pagamento Stripe non riuscito.");
      }

      setPaymentStatus("redirecting");
      setPaymentMessage(payload.message || "Apertura checkout Stripe in corso...");

      if (typeof window !== "undefined") {
        window.location.assign(payload.url);
      }
    } catch (error) {
      setPaymentStatus("error");
      setPaymentMessage(error instanceof Error ? error.message : "Errore avvio pagamento.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
          Nuova spedizione
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Prepara e avvia la spedizione</h2>
        <p className="text-sm text-slate-600">
          Compila i dati, avvia il checkout Stripe e crea la spedizione BRT dopo conferma
          pagamento.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Nome e cognome</span>
          <input
            value={form.customerName}
            onChange={(event) => updateField("customerName", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Telefono</span>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Servizio</span>
          <select
            value={form.serviceCode}
            onChange={(event) => updateField("serviceCode", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          >
            {area.serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <button
          type="button"
          onClick={() => setBillingAccordionOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-4 text-left"
          aria-expanded={billingAccordionOpen}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Dati Fattura
            </p>
            <p className="text-sm text-slate-600">
              Mi servono per collegare il pagamento Stripe alla fattura e preparare l&apos;emissione fiscale.
            </p>
          </div>
          <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {billingAccordionOpen ? "Chiudi" : "Apri"}
          </span>
        </button>

        {billingAccordionOpen ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Tipo intestazione</span>
            <select
              value={form.billingType}
              onChange={(event) => updateField("billingType", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            >
              <option value="privato">Privato</option>
              <option value="azienda">Azienda / professionista</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Ragione sociale / intestatario</span>
            <input
              value={form.billingCompanyName}
              onChange={(event) => updateField("billingCompanyName", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              placeholder="Nome azienda o intestatario fattura"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Partita IVA</span>
            <input
              value={form.billingVatNumber}
              onChange={(event) => updateField("billingVatNumber", event.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              placeholder="IT12345678901"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Codice fiscale</span>
            <input
              value={form.billingTaxCode}
              onChange={(event) => updateField("billingTaxCode", event.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Codice SDI</span>
            <input
              value={form.billingRecipientCode}
              onChange={(event) =>
                updateField("billingRecipientCode", event.target.value.toUpperCase())
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              placeholder="XXXXXXX"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">PEC</span>
            <input
              type="email"
              value={form.billingCertifiedEmail}
              onChange={(event) => updateField("billingCertifiedEmail", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              placeholder="pec@azienda.it"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Indirizzo fatturazione</span>
            <input
              value={form.billingAddress}
              onChange={(event) => updateField("billingAddress", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
              placeholder="Via, civico"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">CAP fatturazione</span>
            <input
              value={form.billingZIPCode}
              onChange={(event) => updateField("billingZIPCode", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Citta fatturazione</span>
            <input
              value={form.billingCity}
              onChange={(event) => updateField("billingCity", event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Provincia fatturazione</span>
            <input
              value={form.billingProvince}
              onChange={(event) =>
                updateField("billingProvince", event.target.value.toUpperCase())
              }
              maxLength={2}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="block text-sm font-medium text-slate-700">Indirizzo ritiro</span>
          <input
            value={form.pickupAddress}
            onChange={(event) => updateField("pickupAddress", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            placeholder="Via, civico"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">CAP ritiro</span>
          <input
            value={form.pickupZIPCode}
            onChange={(event) => updateField("pickupZIPCode", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Citta ritiro</span>
          <input
            value={form.pickupCity}
            onChange={(event) => updateField("pickupCity", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Provincia ritiro</span>
          <input
            value={form.pickupProvince}
            onChange={(event) => updateField("pickupProvince", event.target.value.toUpperCase())}
            maxLength={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="block text-sm font-medium text-slate-700">Destinatario / Azienda</span>
          <input
            value={form.destinationCompanyName}
            onChange={(event) => updateField("destinationCompanyName", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="block text-sm font-medium text-slate-700">Indirizzo destinazione</span>
          <input
            value={form.destinationAddress}
            onChange={(event) => updateField("destinationAddress", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">CAP destinazione</span>
          <input
            value={form.destinationZIPCode}
            onChange={(event) => updateField("destinationZIPCode", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Citta destinazione</span>
          <input
            value={form.destinationCity}
            onChange={(event) => updateField("destinationCity", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Provincia destinazione</span>
          <input
            value={form.destinationProvince}
            onChange={(event) =>
              updateField("destinationProvince", event.target.value.toUpperCase())
            }
            maxLength={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Nazione destinazione</span>
          <input
            value={form.destinationCountry}
            onChange={(event) => updateField("destinationCountry", event.target.value.toUpperCase())}
            maxLength={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={onSearchPudo}
          disabled={pudoStatus === "loading"}
          className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-cyan-500 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pudoStatus === "loading" ? "Ricerca punti BRT..." : "Cerca punto BRT PUDO"}
        </button>
        {pudoMessage ? (
          <p
            className={
              pudoStatus === "error"
                ? "mt-3 text-sm font-medium text-red-600"
                : "mt-3 text-sm font-medium text-slate-700"
            }
          >
            {pudoMessage}
          </p>
        ) : null}
        {pudoPoints.length > 0 ? (
          <button
            type="button"
            onClick={() => setPudoModalOpen(true)}
            className="mt-3 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-sm font-semibold text-cyan-900 transition hover:border-cyan-300 hover:bg-cyan-100"
          >
            {`Apri risultati PUDO (${pudoPoints.length})`}
          </button>
        ) : null}
        {form.pudoId ? (
          <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
            <p className="font-semibold">
              Punto BRT selezionato: {selectedPudoPoint?.name || form.pudoId}
            </p>
            {selectedPudoPoint ? (
              <p className="mt-1">
                {selectedPudoPoint.address}, {selectedPudoPoint.zipCode} {selectedPudoPoint.city}{" "}
                {selectedPudoPoint.province}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Numero colli</span>
          <input
            type="number"
            min="1"
            value={form.parcelCount}
            onChange={(event) => updateField("parcelCount", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Lunghezza (cm)</span>
          <input
            type="number"
            min="1"
            value={form.parcelLengthCM}
            onChange={(event) => updateField("parcelLengthCM", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Altezza (cm)</span>
          <input
            type="number"
            min="1"
            value={form.parcelHeightCM}
            onChange={(event) => updateField("parcelHeightCM", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Profondita (cm)</span>
          <input
            type="number"
            min="1"
            value={form.parcelDepthCM}
            onChange={(event) => updateField("parcelDepthCM", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Peso totale (kg)</span>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={form.weightKG}
            onChange={(event) => updateField("weightKG", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            required
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
        <p className="font-semibold">Calcolo BRT ufficiale</p>
        <p className="mt-1">
          Formula volume: <strong>L x H x P / 4000</strong> moltiplicata per il numero colli.
        </p>
        <p className="mt-2">
          Peso volumetrico BRT: <strong>{volumetricWeightKG || 0} kg</strong>
        </p>
        <p className="mt-1">
          Volume totale: <strong>{volumeM3 || 0} m3</strong>
        </p>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="block text-sm font-medium text-slate-700">Note operative</span>
        <textarea
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          placeholder="Citofono, fascia oraria o istruzioni utili"
        />
      </label>

      {message ? (
        <p
          className={
            status === "success"
              ? "mt-4 text-sm font-medium text-emerald-600"
              : "mt-4 text-sm font-medium text-red-600"
          }
        >
          {message}
        </p>
      ) : null}

      {paymentMessage ? (
        <p
          className={
            paymentStatus === "error"
                ? "mt-4 text-sm font-medium text-red-600"
                : "mt-4 text-sm font-medium text-cyan-700"
          }
        >
          {paymentMessage}
        </p>
      ) : null}

      {status === "success" ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          {routingInfo ? (
            <div className="mb-3 rounded-2xl border border-cyan-100 bg-white p-4 text-cyan-950">
              <p className="font-semibold">Instradamento BRT verificato</p>
              <p className="mt-1">
                Terminale arrivo: <strong>{routingInfo.arrivalTerminal || "n/d"}</strong>
              </p>
              <p className="mt-1">
                Deposito arrivo: <strong>{routingInfo.arrivalDepot || "n/d"}</strong>
              </p>
              <p className="mt-1">
                Zona consegna: <strong>{routingInfo.deliveryZone || "n/d"}</strong>
              </p>
            </div>
          ) : null}
          <p className="font-semibold">Tracking: {trackingCode || "non disponibile"}</p>
          <p className="mt-1">Parcel ID: {parcelId || "non disponibile"}</p>
          <p className="mt-1">
            Peso volumetrico BRT: <strong>{volumetricWeightKG || 0} kg</strong>
          </p>
          <p className="mt-1">
            Conferma BRT: <strong>{confirmed ? "confermata" : "da confermare"}</strong>
          </p>
          {labelHref ? (
            <a
              href={labelHref}
              download={`etichetta-brt-${trackingCode || "spedizione"}.pdf`}
              className="mt-3 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Scarica etichetta PDF
            </a>
          ) : null}
          {!confirmed && numericSenderReference && alphanumericSenderReference ? (
            <button
              type="button"
              onClick={onConfirmShipment}
              disabled={confirmStatus === "loading"}
              className="ml-3 inline-flex rounded-full border border-cyan-300 bg-white px-5 py-2 text-sm font-semibold text-cyan-800 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirmStatus === "loading" ? "Confermo..." : "Conferma spedizione BRT"}
            </button>
          ) : null}
          {parcelId ? (
            <button
              type="button"
              onClick={onRefreshTracking}
              disabled={trackingStatus === "loading"}
              className="ml-3 inline-flex rounded-full border border-emerald-300 bg-white px-5 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {trackingStatus === "loading" ? "Aggiorno tracking..." : "Aggiorna tracking"}
            </button>
          ) : null}
          {numericSenderReference && alphanumericSenderReference ? (
            <button
              type="button"
              onClick={onCreateManifest}
              disabled={manifestStatus === "loading"}
              className="ml-3 inline-flex rounded-full border border-indigo-300 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {manifestStatus === "loading" ? "Invio manifest..." : "Genera manifest BRT"}
            </button>
          ) : null}
          {numericSenderReference && alphanumericSenderReference ? (
            <button
              type="button"
              onClick={onDeleteShipment}
              disabled={deleteStatus === "loading"}
              className="ml-3 inline-flex rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteStatus === "loading" ? "Annullamento..." : "Annulla spedizione BRT"}
            </button>
          ) : null}
          {confirmMessage ? (
            <p
              className={
                confirmStatus === "error"
                  ? "mt-3 font-medium text-red-600"
                  : "mt-3 font-medium text-emerald-700"
              }
            >
              {confirmMessage}
            </p>
          ) : null}
          {manifestMessage ? (
            <p
              className={
                manifestStatus === "error"
                  ? "mt-3 font-medium text-red-600"
                  : "mt-3 font-medium text-indigo-700"
              }
            >
              {manifestMessage}
            </p>
          ) : null}
          {deleteMessage ? (
            <p
              className={
                deleteStatus === "error"
                  ? "mt-3 font-medium text-red-600"
                  : "mt-3 font-medium text-red-700"
              }
            >
              {deleteMessage}
            </p>
          ) : null}
          {trackingMessage ? <p className="mt-3 font-medium">{trackingMessage}</p> : null}
          {trackingInfo ? (
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-white p-4 text-slate-900">
              <p>
                Stato: <strong>{trackingInfo.status || "n/d"}</strong>
              </p>
              <p className="mt-1">
                Descrizione: <strong>{trackingInfo.statusDescription || "n/d"}</strong>
              </p>
              {trackingInfo.shipmentId ? (
                <p className="mt-1">
                  Shipment ID: <strong>{trackingInfo.shipmentId}</strong>
                </p>
              ) : null}
              {trackingInfo.events.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {trackingInfo.events.slice(0, 5).map((eventItem, index) => (
                    <div key={`${eventItem.date}-${eventItem.time}-${index}`} className="text-sm">
                      <strong>
                        {eventItem.date || "--"} {eventItem.time || "--"}
                      </strong>
                      : {eventItem.description || "Evento"} {eventItem.branch ? `(${eventItem.branch})` : ""}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          status === "submitting" || paymentStatus === "loading" || paymentStatus === "redirecting"
        }
        className="mt-6 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paymentStatus === "loading"
          ? "Preparo il pagamento..."
          : paymentStatus === "redirecting"
            ? "Reindirizzamento a Stripe..."
            : status === "submitting"
              ? "Pagamento confermato, creo la spedizione..."
              : "Paga con Stripe e crea spedizione BRT"}
      </button>
      <p className="mt-3 text-sm text-slate-600">
        Il pagamento viene completato prima: solo dopo la conferma Stripe il sistema crea la
        spedizione BRT.
      </p>

      {pudoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Punti BRT PUDO
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Seleziona il punto piu comodo tra i risultati trovati.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPudoModalOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Chiudi
              </button>
            </div>
            <div className="max-h-[calc(85vh-96px)] overflow-y-auto px-6 py-5">
              <div className="space-y-3">
                {pudoPoints.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold">{point.name || point.id}</p>
                        <p className="mt-1">
                          {point.address}, {point.zipCode} {point.city} {point.province}
                        </p>
                        {point.country ? <p className="mt-1 text-slate-500">{point.country}</p> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateField("pudoId", point.id);
                          setPudoModalOpen(false);
                        }}
                        className={
                          form.pudoId === point.id
                            ? "inline-flex rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white"
                            : "inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        }
                      >
                        {form.pudoId === point.id ? "Punto selezionato" : "Usa questo punto BRT"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
