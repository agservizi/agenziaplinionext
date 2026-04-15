"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { ClientAreaConfig } from "@/lib/client-area";
import { fetchClientPortalProfile, getClientPortalToken } from "@/lib/client-portal-auth";
import { SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY } from "@/lib/shipment-payment";
import type { PublicShippingPricingRule } from "@/lib/shipping-pricing";

export type BrtShipmentLiveSummary = {
  carrierProvider: string;
  serviceLabel: string;
  destinationCountry: string;
  parcelCount: number;
  packageSize: string;
  packageLabel: string;
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
  pricingRules?: PublicShippingPricingRule[];
  onSummaryChange?: (summary: BrtShipmentLiveSummary) => void;
};

type ShipmentFormState = {
  carrierProvider: string;
  inpostPackageSize: string;
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

const DESTINATION_COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "IT", label: "Italia" },
  { code: "AT", label: "Austria" },
  { code: "BE", label: "Belgio" },
  { code: "BG", label: "Bulgaria" },
  { code: "HR", label: "Croazia" },
  { code: "CZ", label: "Repubblica Ceca" },
  { code: "DK", label: "Danimarca" },
  { code: "EE", label: "Estonia" },
  { code: "FI", label: "Finlandia" },
  { code: "FR", label: "Francia" },
  { code: "DE", label: "Germania" },
  { code: "GR", label: "Grecia" },
  { code: "HU", label: "Ungheria" },
  { code: "IE", label: "Irlanda" },
  { code: "LV", label: "Lettonia" },
  { code: "LT", label: "Lituania" },
  { code: "LU", label: "Lussemburgo" },
  { code: "NL", label: "Paesi Bassi" },
  { code: "NO", label: "Norvegia" },
  { code: "PL", label: "Polonia" },
  { code: "PT", label: "Portogallo" },
  { code: "RO", label: "Romania" },
  { code: "SK", label: "Slovacchia" },
  { code: "SI", label: "Slovenia" },
  { code: "ES", label: "Spagna" },
  { code: "SE", label: "Svezia" },
  { code: "CH", label: "Svizzera" },
  { code: "GB", label: "Regno Unito" },
];

const INPOST_PACKAGE_OPTIONS = [
  { value: "small", label: "Piccolo", shortLabel: "S", dimensions: "8 x 38 x 64 cm", lengthCM: 64, heightCM: 8, depthCM: 38 },
  { value: "medium", label: "Medio", shortLabel: "M", dimensions: "19 x 38 x 64 cm", lengthCM: 64, heightCM: 19, depthCM: 38 },
  { value: "large", label: "Grande", shortLabel: "L", dimensions: "41 x 38 x 64 cm", lengthCM: 64, heightCM: 41, depthCM: 38 },
] as const;

function getCountryLabelByCode(code: string) {
  const normalized = String(code || "").trim().toUpperCase();
  return DESTINATION_COUNTRY_OPTIONS.find((country) => country.code === normalized)?.label || normalized;
}

function buildInitialState(area: ClientAreaConfig): ShipmentFormState {
  return {
    carrierProvider: "brt",
    inpostPackageSize: "small",
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

function getServiceCountryValidationMessage(serviceCode: string, destinationCountry: string) {
  if (serviceCode === "ritiro-nazionale" && destinationCountry !== "IT") {
    return "Con 'Spedizione nazionale' puoi spedire solo in Italia (IT).";
  }
  if (serviceCode === "ritiro-internazionale" && destinationCountry === "IT") {
    return "Con 'Spedizione internazionale' seleziona una nazione diversa da IT.";
  }
  return "";
}

function getCarrierValidationMessage(carrierProvider: string, destinationCountry: string) {
  if (carrierProvider === "inpost" && destinationCountry !== "IT") {
    return "InPost e disponibile in questo flusso solo per destinazioni italiane (IT).";
  }
  return "";
}

function getInpostParcelValidationMessage(input: {
  carrierProvider: string;
  inpostPackageSize: string;
  parcelCount: string;
  parcelLengthCM: string;
  parcelHeightCM: string;
  parcelDepthCM: string;
  weightKG: string;
}) {
  if (input.carrierProvider !== "inpost") return "";
  if (!input.inpostPackageSize) return "Seleziona un formato InPost tra S, M o L.";

  const parcelCount = Number(input.parcelCount) || 0;
  const length = Number(input.parcelLengthCM) || 0;
  const height = Number(input.parcelHeightCM) || 0;
  const depth = Number(input.parcelDepthCM) || 0;
  const totalWeight = Number(input.weightKG) || 0;
  const perParcelWeight = parcelCount > 0 ? totalWeight / parcelCount : 0;
  const ordered = [length, height, depth].sort((left, right) => left - right);
  const [smallest, medium, largest] = ordered;

  if (medium > 38 || largest > 64) {
    return "Per InPost ogni collo deve rientrare al massimo in 38 x 64 cm sui due lati maggiori.";
  }
  if (smallest > 41) {
    return "Per InPost il lato minore del collo non puo superare 41 cm (formato L).";
  }
  if (perParcelWeight > 25) {
    return "Per InPost ogni collo non puo superare 25 kg.";
  }

  return "";
}

export default function BrtShipmentForm({
  area,
  pricingRules = [],
  onSummaryChange,
}: BrtShipmentFormProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ShipmentFormState>(() => buildInitialState(area));
  const [billingAccordionOpen, setBillingAccordionOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "redirecting" | "error">(
    "idle",
  );
  const [paymentMessage, setPaymentMessage] = useState("");
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
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
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const totalSteps = 5;
  const isInpost = form.carrierProvider === "inpost";
  const stepLabels = [
    "Anagrafica",
    isInpost ? "Destinazione e Punto InPost" : "Ritiro e Destinazione",
    "Colli e Peso",
    "Fatturazione",
    "Riepilogo e Pagamento",
  ];

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
  const selectedCarrierLabel = form.carrierProvider === "inpost" ? "InPost" : "BRT";
  const serviceCountryError = getServiceCountryValidationMessage(
    form.serviceCode,
    form.destinationCountry,
  );
  const carrierValidationError = getCarrierValidationMessage(
    form.carrierProvider,
    form.destinationCountry,
  );
  const inpostParcelValidationError = getInpostParcelValidationMessage({
    carrierProvider: form.carrierProvider,
    inpostPackageSize: form.inpostPackageSize,
    parcelCount: form.parcelCount,
    parcelLengthCM: form.parcelLengthCM,
    parcelHeightCM: form.parcelHeightCM,
    parcelDepthCM: form.parcelDepthCM,
    weightKG: form.weightKG,
  });
  const matchedPricingRule = useMemo(() => {
    if (serviceCountryError || carrierValidationError || inpostParcelValidationError) return null;
    if (taxableWeightKG <= 0) return null;

    const destinationCountry = String(form.destinationCountry || "IT").trim().toUpperCase();
    const serviceScope = destinationCountry === "IT" ? "national" : "international";
    const sortedRules = [...pricingRules].sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.minWeightKG - right.minWeightKG;
    });

    return (
      sortedRules.find((rule) => {
        if (!rule.active) return false;
        if (rule.carrierProvider !== form.carrierProvider) return false;
        if (form.carrierProvider === "inpost") {
          return rule.packageSize === form.inpostPackageSize;
        }
        const ruleScope = String(rule.serviceScope || "all").trim().toLowerCase();
        if (ruleScope !== serviceScope && ruleScope !== "all") return false;
        if (serviceScope === "international") {
          const ruleCountry = String(rule.countryCode || "").trim().toUpperCase();
          if (
            ruleCountry !== destinationCountry &&
            ruleCountry !== "ALL" &&
            ruleCountry !== ""
          ) {
            return false;
          }
        }

        const weightMatches =
          taxableWeightKG >= rule.minWeightKG &&
          (rule.maxWeightKG <= 0 || taxableWeightKG <= rule.maxWeightKG);
        const volumeMatches =
          volumeM3 >= rule.minVolumeM3 &&
          (rule.maxVolumeM3 <= 0 || volumeM3 <= rule.maxVolumeM3);

        return weightMatches && volumeMatches;
      }) || null
    );
  }, [
    carrierValidationError,
    form.carrierProvider,
    form.destinationCountry,
    form.inpostPackageSize,
    inpostParcelValidationError,
    pricingRules,
    serviceCountryError,
    taxableWeightKG,
    volumeM3,
  ]);
  const estimatedCostLabel = matchedPricingRule
    ? `${matchedPricingRule.priceEUR.toFixed(2).replace(".", ",")} euro`
    : `Listino ${selectedCarrierLabel} non disponibile`;
  const listinoStrictError = useMemo(() => {
    if (serviceCountryError || carrierValidationError || inpostParcelValidationError) return "";
    if (taxableWeightKG <= 0) return "";

    if (matchedPricingRule) return "";
    return `Nessuna fascia attiva trovata nel listino ${selectedCarrierLabel} per peso, volume o destinazione.`;
  }, [
    carrierValidationError,
    inpostParcelValidationError,
    matchedPricingRule,
    selectedCarrierLabel,
    serviceCountryError,
    taxableWeightKG,
  ]);
  const selectedPudoPoint = useMemo(
    () => pudoPoints.find((point) => point.id === form.pudoId) || null,
    [form.pudoId, pudoPoints],
  );
  const selectedInpostPackage = useMemo(
    () => INPOST_PACKAGE_OPTIONS.find((option) => option.value === form.inpostPackageSize) || INPOST_PACKAGE_OPTIONS[0],
    [form.inpostPackageSize],
  );

  const updateField = <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => {
    setStepError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!form.customerName.trim()) return "Inserisci nome e cognome.";
      if (!form.email.trim().includes("@")) return "Inserisci una email valida.";
      if (!form.phone.trim()) return "Inserisci il numero di telefono.";
      if (!form.serviceCode.trim()) return "Seleziona un servizio.";
      if (!form.destinationCountry.trim()) return "Inserisci la nazione di destinazione.";
      if (serviceCountryError) return serviceCountryError;
      if (carrierValidationError) return carrierValidationError;
      return "";
    }
    if (currentStep === 2) {
      if (!isInpost) {
        if (!form.pickupAddress.trim()) return "Inserisci l'indirizzo di ritiro.";
        if (!form.pickupZIPCode.trim()) return "Inserisci il CAP di ritiro.";
        if (!form.pickupCity.trim()) return "Inserisci la citta di ritiro.";
        if (!form.pickupProvince.trim()) return "Inserisci la provincia di ritiro.";
      }
      if (!form.destinationCompanyName.trim()) return "Inserisci il destinatario/azienda.";
      if (!form.destinationAddress.trim()) return "Inserisci l'indirizzo di destinazione.";
      if (!form.destinationZIPCode.trim()) return "Inserisci il CAP di destinazione.";
      if (!form.destinationCity.trim()) return "Inserisci la citta di destinazione.";
      if (!form.destinationProvince.trim()) return "Inserisci la provincia di destinazione.";
      if (!form.destinationCountry.trim()) return "Inserisci la nazione di destinazione.";
      if (serviceCountryError) return serviceCountryError;
      if (carrierValidationError) return carrierValidationError;
      return "";
    }
    if (currentStep === 3) {
      if ((Number(form.parcelCount) || 0) <= 0) return "Inserisci un numero colli valido.";
      if ((Number(form.parcelLengthCM) || 0) <= 0) return "Inserisci una lunghezza valida.";
      if ((Number(form.parcelHeightCM) || 0) <= 0) return "Inserisci un'altezza valida.";
      if ((Number(form.parcelDepthCM) || 0) <= 0) return "Inserisci una profondita valida.";
      if ((Number(form.weightKG) || 0) <= 0) return "Inserisci un peso valido.";
      if (inpostParcelValidationError) return inpostParcelValidationError;
      if (listinoStrictError) return listinoStrictError;
      return "";
    }
    return "";
  };

  const goNextStep = () => {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");
    setStep((current) => Math.min(totalSteps, current + 1));
  };

  const goPreviousStep = () => {
    setStepError("");
    setStep((current) => Math.max(1, current - 1));
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
          billingCompanyName: current.billingCompanyName || profile.companyName || "",
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
    if (form.carrierProvider !== "inpost") return;
    const nextPackage = INPOST_PACKAGE_OPTIONS.find((option) => option.value === form.inpostPackageSize);
    if (!nextPackage) return;

    setForm((current) => {
      if (
        current.parcelLengthCM === String(nextPackage.lengthCM) &&
        current.parcelHeightCM === String(nextPackage.heightCM) &&
        current.parcelDepthCM === String(nextPackage.depthCM)
      ) {
        return current;
      }

      return {
        ...current,
        parcelLengthCM: String(nextPackage.lengthCM),
        parcelHeightCM: String(nextPackage.heightCM),
        parcelDepthCM: String(nextPackage.depthCM),
      };
    });
  }, [form.carrierProvider, form.inpostPackageSize]);

  useEffect(() => {
    onSummaryChange?.({
      carrierProvider: form.carrierProvider,
      serviceLabel: `${selectedCarrierLabel} • ${selectedService?.label || "Spedizione"}`,
      destinationCountry: form.destinationCountry,
      parcelCount,
      packageSize: isInpost ? form.inpostPackageSize : "",
      packageLabel: isInpost
        ? `${selectedInpostPackage.label} (${selectedInpostPackage.shortLabel})`
        : "",
      actualWeightKG,
      volumetricWeightKG,
      taxableWeightKG,
      volumeM3,
      dimensionsLabel: `${parcelLengthCM || 0} x ${parcelHeightCM || 0} x ${parcelDepthCM || 0} cm`,
      pudoSelected: Boolean(form.pudoId),
      estimatedCostLabel,
    });
  }, [
    actualWeightKG,
    area.serviceOptions,
    form.carrierProvider,
    form.destinationCountry,
    isInpost,
    form.pudoId,
    form.serviceCode,
    form.inpostPackageSize,
    onSummaryChange,
    parcelCount,
    selectedCarrierLabel,
    parcelDepthCM,
    parcelHeightCM,
    parcelLengthCM,
    selectedInpostPackage.label,
    selectedInpostPackage.shortLabel,
    selectedService?.label,
    taxableWeightKG,
    volumetricWeightKG,
    volumeM3,
    estimatedCostLabel,
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
      const isInpost = form.carrierProvider === "inpost";

      const endpoint = isInpost
        ? "/api/client-area/spedizioni/inpost/points"
        : isLocalhost
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
        throw new Error(
          payload.message || `Ricerca punti ${isInpost ? "InPost" : "PUDO"} non disponibile.`,
        );
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < totalSteps) {
      goNextStep();
      return;
    }
    setPaymentStatus("loading");
    setPaymentMessage("");

    try {
      if (serviceCountryError) {
        setPaymentStatus("error");
        setPaymentMessage(serviceCountryError);
        return;
      }
      if (carrierValidationError) {
        setPaymentStatus("error");
        setPaymentMessage(carrierValidationError);
        return;
      }
      if (listinoStrictError) {
        setPaymentStatus("error");
        setPaymentMessage(listinoStrictError);
        return;
      }

      const shipmentPayload = buildSubmissionPayload();
      const token = getClientPortalToken();

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SHIPMENT_PAYMENT_DRAFT_STORAGE_KEY,
          JSON.stringify({
            ...shipmentPayload,
            token,
          }),
        );
      }

      const response = await fetch("/api/client-area/spedizioni/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipmentPayload),
      });

      const rawPayload = await response.text();
      let payload: {
        message?: string;
        url?: string;
        errorCode?: string;
      } = {};
      try {
        payload = rawPayload ? (JSON.parse(rawPayload) as typeof payload) : {};
      } catch {
        payload = { message: rawPayload || undefined };
      }

      if (!response.ok || !payload.url) {
        const apiError = new Error(payload.message || "Avvio pagamento Stripe non riuscito.") as Error & {
          status?: number;
          errorCode?: string;
        };
        apiError.status = response.status;
        apiError.errorCode = payload.errorCode;
        throw apiError;
      }

      setPaymentStatus("redirecting");
      setPaymentMessage(payload.message || "Apertura checkout Stripe in corso...");

      if (typeof window !== "undefined") {
        window.location.assign(payload.url);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Errore avvio pagamento.";
      const errorCode =
        typeof error === "object" && error && "errorCode" in error
          ? String((error as { errorCode?: unknown }).errorCode || "")
          : "";
      setPaymentStatus("error");
      setPaymentMessage(errorMessage);
      if (
        errorCode === "SHIPPING_LIMIT_EXCEEDED" ||
        errorMessage.includes("non consente spedizioni con peso/volume") ||
        errorMessage.includes("non consente spedizioni con peso superiore")
      ) {
        setPaymentMessage(errorMessage);
      }
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
          Compila i dati, avvia il checkout Stripe e crea la spedizione con BRT o InPost dopo
          conferma pagamento.
        </p>
        {profileStatus === "ready" ? (
          <p className="text-xs font-medium text-cyan-700">
            Ho precaricato i dati base dal tuo profilo cliente.
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>
            Step {step} / {totalSteps}
          </span>
          <span>{stepLabels[step - 1]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-cyan-600 transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div key={`wizard-step-${step}`} className="transition-all duration-200">
      {step === 1 ? (
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
          <span className="block text-sm font-medium text-slate-700">Corriere</span>
          <select
            value={form.carrierProvider}
            onChange={(event) => {
              const nextProvider = event.target.value;
              setStepError("");
              setForm((current) => ({
                ...current,
                carrierProvider: nextProvider,
                inpostPackageSize: nextProvider === "inpost" ? current.inpostPackageSize || "small" : current.inpostPackageSize,
                serviceCode:
                  nextProvider === "inpost"
                    ? "ritiro-nazionale"
                    : current.serviceCode || area.serviceOptions[0]?.value || "ritiro-nazionale",
                pudoId: "",
                destinationCountry:
                  nextProvider === "inpost" ? "IT" : current.destinationCountry || "IT",
              }));
              setPudoPoints([]);
              setPudoModalOpen(false);
              setPudoMessage("");
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          >
            <option value="brt">BRT</option>
            <option value="inpost">InPost</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Servizio</span>
          <select
            value={form.serviceCode}
            onChange={(event) => {
              setStepError("");
              const nextServiceCode = event.target.value;
              setForm((current) => {
                const nextCountry =
                  current.carrierProvider === "inpost"
                    ? "IT"
                    : nextServiceCode === "ritiro-nazionale"
                    ? "IT"
                    : nextServiceCode === "ritiro-internazionale" && current.destinationCountry === "IT"
                      ? "FR"
                      : current.destinationCountry;
                return {
                  ...current,
                  serviceCode: nextServiceCode,
                  destinationCountry: nextCountry,
                };
              });
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          >
            {area.serviceOptions
              .filter((option) =>
                form.carrierProvider === "inpost"
                  ? option.value === "ritiro-nazionale"
                  : true,
              )
              .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
              ))}
          </select>
          {form.carrierProvider === "inpost" ? (
            <span className="block text-xs font-medium text-cyan-700">
              Per InPost il flusso attivo resta solo nazionale su Italia.
            </span>
          ) : null}
        </label>
      </div>
      ) : null}

      {step === 4 ? (
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
      ) : null}

      {step === 2 && !isInpost ? (
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
      ) : null}

      {step === 2 && isInpost ? (
        <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
          <p className="font-semibold">Consegna al punto InPost</p>
          <p className="mt-2">
            Per InPost non e previsto il ritiro a domicilio in questo flusso: prepari il collo e lo
            consegni nel punto InPost che selezioni qui sotto.
          </p>
        </div>
      ) : null}

      {step === 2 ? (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isInpost ? "Destinazione e Consegna" : "Destinazione"}
          </p>
        </div>
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
          <select
            value={form.destinationCountry}
            onChange={(event) => updateField("destinationCountry", event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            disabled={form.carrierProvider === "inpost"}
            required
          >
            {DESTINATION_COUNTRY_OPTIONS.filter((country) =>
              form.carrierProvider === "inpost"
                ? country.code === "IT"
                : form.serviceCode === "ritiro-nazionale"
                  ? country.code === "IT"
                  : country.code !== "IT",
            ).map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
          {form.carrierProvider === "inpost" ? (
            <span className="block text-xs font-medium text-cyan-700">
              InPost resta disponibile solo per destinazioni italiane.
            </span>
          ) : null}
        </label>
      </div>
      ) : null}

      {step === 2 && serviceCountryError ? (
        <p className="mt-3 text-sm font-medium text-red-600">{serviceCountryError}</p>
      ) : null}
      {step === 2 && carrierValidationError ? (
        <p className="mt-3 text-sm font-medium text-red-600">{carrierValidationError}</p>
      ) : null}

      {step === 2 ? (
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700">
          {isInpost
            ? "Seleziona il punto InPost dove consegnerai il pacco."
            : "Se vuoi, puoi associare anche un punto BRT PUDO alla spedizione."}
        </p>
        <button
          type="button"
          onClick={onSearchPudo}
          disabled={pudoStatus === "loading"}
          className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-cyan-500 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pudoStatus === "loading"
            ? `Ricerca punti ${selectedCarrierLabel}...`
            : form.carrierProvider === "inpost"
              ? "Cerca punto InPost"
              : "Cerca punto BRT PUDO"}
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
            {`Apri risultati ${form.carrierProvider === "inpost" ? "InPost" : "PUDO"} (${pudoPoints.length})`}
          </button>
        ) : null}
        {form.pudoId ? (
          <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
            <p className="font-semibold">
              Punto {selectedCarrierLabel} selezionato: {selectedPudoPoint?.name || form.pudoId}
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
      ) : null}

      {step === 3 && !isInpost ? (
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
      ) : null}

      {step === 3 && isInpost ? (
        <div className="mt-6 space-y-4">
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

          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Formato pacco InPost</span>
            <div className="grid gap-3 md:grid-cols-3">
              {INPOST_PACKAGE_OPTIONS.map((option) => {
                const active = form.inpostPackageSize === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("inpostPackageSize", option.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-cyan-500 bg-cyan-50 shadow-[0_0_0_2px_rgba(6,182,212,0.15)]"
                        : "border-slate-200 bg-white hover:border-cyan-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900">{option.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {option.shortLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{option.dimensions}</p>
                    <p className="mt-1 text-sm text-slate-600">25 kg</p>
                  </button>
                );
              })}
            </div>
          </div>

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
      ) : null}

      {step === 3 && !isInpost ? (
      <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
        <p className="font-semibold">Calcolo peso volumetrico {selectedCarrierLabel}</p>
        <p className="mt-1">
          Formula volume: <strong>L x H x P / 4000</strong> moltiplicata per il numero colli.
        </p>
        <p className="mt-2">
          Peso volumetrico {selectedCarrierLabel}: <strong>{volumetricWeightKG || 0} kg</strong>
        </p>
        <p className="mt-1">
          Volume totale: <strong>{volumeM3 || 0} m3</strong>
        </p>
      </div>
      ) : null}

      {step === 3 && form.carrierProvider === "inpost" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Formati InPost supportati</p>
          <p className="mt-2">S: 8 x 38 x 64 cm, massimo 25 kg</p>
          <p className="mt-1">M: 19 x 38 x 64 cm, massimo 25 kg</p>
          <p className="mt-1">L: 41 x 38 x 64 cm, massimo 25 kg</p>
          <p className="mt-2 text-amber-800">
            Hai selezionato: <strong>{selectedInpostPackage.label} ({selectedInpostPackage.shortLabel})</strong>.
          </p>
        </div>
      ) : null}

      {step === 5 ? (
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
      ) : null}

      {step === 5 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">Riepilogo spedizione</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <p>
              <strong>Servizio:</strong> {selectedCarrierLabel} • {selectedService?.label || form.serviceCode}
            </p>
            <p>
              <strong>Destinazione:</strong> {form.destinationCity} (
              {getCountryLabelByCode(form.destinationCountry)})
            </p>
            <p>
              <strong>Colli:</strong> {parcelCount} - <strong>Peso tassabile:</strong>{" "}
              {taxableWeightKG || 0} kg
            </p>
            <p>
              <strong>{isInpost ? "Stima InPost" : "Stima costo"}:</strong> {estimatedCostLabel}
            </p>
            {isInpost ? (
              <p>
                <strong>Formato InPost:</strong> {selectedInpostPackage.label} ({selectedInpostPackage.shortLabel})
              </p>
            ) : null}
            <p className="md:col-span-2">
              <strong>{form.carrierProvider === "inpost" ? "Punto InPost" : "PUDO"}:</strong>{" "}
              {form.pudoId
                ? selectedPudoPoint?.name || form.pudoId
                : "Nessun punto selezionato (consegna standard)"}
            </p>
            {isInpost ? (
              <p className="md:col-span-2">
                <strong>Operativita InPost:</strong> consegni il pacco al punto selezionato dopo il pagamento.
              </p>
            ) : (
              <p className="md:col-span-2">
                <strong>Operativita BRT:</strong> il ritiro resta gestito all&apos;indirizzo indicato oppure tramite punto PUDO.
              </p>
            )}
          </div>
        </div>
      ) : null}
      </div>

      {stepError ? (
        <p className="mt-4 text-sm font-medium text-red-600">{stepError}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={goPreviousStep}
            className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Indietro
          </button>
        ) : null}
        {step < totalSteps ? (
          <button
            type="button"
            onClick={goNextStep}
            className="inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-500"
          >
            Avanti
          </button>
        ) : (
          <button
            type="submit"
            disabled={paymentStatus === "loading" || paymentStatus === "redirecting"}
            className="inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paymentStatus === "loading"
              ? "Preparo il pagamento..."
              : paymentStatus === "redirecting"
                ? "Reindirizzamento a Stripe..."
                : `Paga con Stripe e crea spedizione ${selectedCarrierLabel}`}
          </button>
        )}
      </div>

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

      {step === totalSteps ? (
        <p className="mt-3 text-sm text-slate-600">
          Il pagamento viene completato prima: solo dopo la conferma Stripe il sistema crea la
          spedizione {selectedCarrierLabel}.
        </p>
      ) : null}

      {pudoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  {form.carrierProvider === "inpost" ? "Punti InPost" : "Punti BRT PUDO"}
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
                        {form.pudoId === point.id
                          ? "Punto selezionato"
                          : form.carrierProvider === "inpost"
                            ? "Usa questo punto InPost"
                            : "Usa questo punto BRT"}
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
