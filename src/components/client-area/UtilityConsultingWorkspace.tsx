"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ClientAreaConfig } from "@/lib/client-area";

function parseApiPayload<T>(raw: string): T {
  try {
    return (raw ? JSON.parse(raw) : {}) as T;
  } catch {
    return {} as T;
  }
}

type WorkspaceProps = {
  area: ClientAreaConfig;
};

type StepId = 1 | 2 | 3;

const DRAFT_STORAGE_KEY = "ag:consulenza-utenze:draft";

const STEP_META: Array<{ id: StepId; title: string; description: string }> = [
  { id: 1, title: "Profilo", description: "Dati anagrafici e servizio" },
  { id: 2, title: "Utenza", description: "Fornitura attuale e contesto" },
  { id: 3, title: "Conferma", description: "Consensi e invio lead" },
];

function calculateEstimatedSavings(serviceType: string, monthlySpendEUR: number) {
  if (!Number.isFinite(monthlySpendEUR) || monthlySpendEUR <= 0) {
    return null;
  }

  const config =
    serviceType === "telefonia"
      ? { minPct: 0.08, maxPct: 0.18, label: "ottimizzazione piano e bundle" }
      : serviceType === "luce"
        ? { minPct: 0.06, maxPct: 0.14, label: "rimodulazione tariffa energia" }
        : { minPct: 0.07, maxPct: 0.16, label: "adeguamento offerta gas" };

  const monthlyMin = monthlySpendEUR * config.minPct;
  const monthlyMax = monthlySpendEUR * config.maxPct;

  return {
    monthlyMin,
    monthlyMax,
    yearlyMin: monthlyMin * 12,
    yearlyMax: monthlyMax * 12,
    label: config.label,
  };
}

function formatEUR(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateEstimateReliability(form: FormState) {
  let score = 0;

  if (form.serviceType.trim() !== "") score += 1;
  if (form.monthlySpendEUR.trim() !== "" && Number.parseFloat(form.monthlySpendEUR.replace(",", ".")) > 0) score += 2;
  if (form.currentProvider.trim() !== "") score += 1;
  if (form.city.trim() !== "") score += 1;
  if (form.customerType === "azienda" && form.businessName.trim() !== "") score += 1;
  if (form.bestContactTime.trim() !== "") score += 1;

  if (score >= 6) {
    return {
      label: "Alta",
      description: "Stima affidabile con dati completi.",
      className: "border-emerald-200 bg-emerald-100 text-emerald-800",
    };
  }

  if (score >= 4) {
    return {
      label: "Media",
      description: "Aggiungi qualche dato per migliorare la precisione.",
      className: "border-amber-200 bg-amber-100 text-amber-800",
    };
  }

  return {
    label: "Bassa",
    description: "Inserisci più dettagli per una stima realistica.",
    className: "border-rose-200 bg-rose-100 text-rose-800",
  };
}

function getMissingEstimateFields(form: FormState) {
  const missing: string[] = [];

  if (!(form.monthlySpendEUR.trim() !== "" && Number.parseFloat(form.monthlySpendEUR.replace(",", ".")) > 0)) {
    missing.push("Spesa media mensile");
  }
  if (form.currentProvider.trim() === "") {
    missing.push("Operatore/Fornitore attuale");
  }
  if (form.city.trim() === "") {
    missing.push("Città");
  }
  if (form.bestContactTime.trim() === "") {
    missing.push("Fascia oraria preferita");
  }
  if (form.customerType === "azienda" && form.businessName.trim() === "") {
    missing.push("Ragione sociale");
  }

  return missing;
}

type FormState = {
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  customerType: "privato" | "azienda";
  businessName: string;
  vatNumber: string;
  currentProvider: string;
  monthlySpendEUR: string;
  city: string;
  bestContactTime: string;
  notes: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
};

function buildInitialState(area: ClientAreaConfig): FormState {
  return {
    serviceType: area.serviceOptions[0]?.value || "telefonia",
    customerName: "",
    email: "",
    phone: "",
    customerType: "privato",
    businessName: "",
    vatNumber: "",
    currentProvider: "",
    monthlySpendEUR: "",
    city: "",
    bestContactTime: "",
    notes: "",
    privacyConsent: false,
    marketingConsent: false,
  };
}

export default function UtilityConsultingWorkspace({ area }: WorkspaceProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(area));
  const [step, setStep] = useState<StepId>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [draftMessage, setDraftMessage] = useState("");

  const selectedService = useMemo(
    () => area.serviceOptions.find((option) => option.value === form.serviceType) || null,
    [area.serviceOptions, form.serviceType],
  );

  const stepTwoConfig = useMemo(() => {
    switch (form.serviceType) {
      case "luce":
        return {
          title: "Dettagli fornitura luce",
          description: "Raccogliamo i dati energetici minimi per una simulazione utile e veloce.",
          providerLabel: "Fornitore luce attuale",
          providerPlaceholder: "Es. Enel Energia, A2A, Iren",
          monthlySpendLabel: "Spesa media bolletta luce (€)",
          cityLabel: "Comune di fornitura",
          cityPlaceholder: "Comune dove è attiva l'utenza luce",
          bestContactTimeLabel: "Fascia oraria per ricontatto",
          bestContactTimePlaceholder: "Es. 09:00 - 12:00",
          notesPlaceholder:
            "Es. potenza contatore, fascia prevalente F1/F2/F3, esigenze su prezzo fisso/variabile",
        };
      case "gas":
        return {
          title: "Dettagli fornitura gas",
          description: "Inserisci i dati principali del contratto gas per valutare margini di risparmio.",
          providerLabel: "Fornitore gas attuale",
          providerPlaceholder: "Es. Eni Plenitude, Edison, Sorgenia",
          monthlySpendLabel: "Spesa media bolletta gas (€)",
          cityLabel: "Comune di fornitura",
          cityPlaceholder: "Comune dove è attiva l'utenza gas",
          bestContactTimeLabel: "Fascia oraria per ricontatto",
          bestContactTimePlaceholder: "Es. 14:00 - 17:00",
          notesPlaceholder:
            "Es. uso riscaldamento, dimensione immobile, preferenza prezzo fisso/indicizzato",
        };
      case "telefonia":
      default:
        return {
          title: "Dettagli servizio telefonia",
          description: "Con questi dati possiamo proporti un piano più adatto a consumo e copertura.",
          providerLabel: "Operatore telefonico attuale",
          providerPlaceholder: "Es. TIM, WindTre, Vodafone, Iliad",
          monthlySpendLabel: "Spesa media mensile linea (€)",
          cityLabel: "Comune utilizzo principale",
          cityPlaceholder: "Comune dove utilizzi prevalentemente il servizio",
          bestContactTimeLabel: "Fascia oraria per ricontatto",
          bestContactTimePlaceholder: "Es. 18:00 - 20:00",
          notesPlaceholder:
            "Es. mobile/fisso, numero linee, esigenze giga/voce, vincoli contrattuali",
        };
    }
  }, [form.serviceType]);

  const monthlySpendValue = useMemo(() => {
    const normalized = form.monthlySpendEUR.replace(",", ".").trim();
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [form.monthlySpendEUR]);

  const estimatedSavings = useMemo(
    () => calculateEstimatedSavings(form.serviceType, monthlySpendValue),
    [form.serviceType, monthlySpendValue],
  );

  const estimateReliability = useMemo(() => calculateEstimateReliability(form), [form]);
  const missingEstimateFields = useMemo(() => getMissingEstimateFields(form), [form]);

  const progressPercentage = useMemo(() => Math.round((step / STEP_META.length) * 100), [step]);

  const stepOneValid =
    form.serviceType.trim() !== "" &&
    form.customerName.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.email.includes("@");

  const stepTwoValid =
    form.customerType === "privato" || form.businessName.trim() !== "";

  const canGoNext = step === 1 ? stepOneValid : step === 2 ? stepTwoValid : true;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;

    const draft = parseApiPayload<Partial<FormState>>(raw);
    if (!draft || typeof draft !== "object") return;

    setForm((current) => ({ ...current, ...draft }));
    setDraftMessage("Bozza ripristinata automaticamente.");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setDraftMessage(`Bozza salvata alle ${hh}:${mm}`);
  }, [form]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  const goNextStep = () => {
    if (step >= 3) return;
    if (!canGoNext) {
      setStatus("error");
      setMessage(
        step === 1
          ? "Compila nome, email valida, telefono e servizio prima di procedere."
          : "Per cliente azienda inserisci almeno la ragione sociale.",
      );
      return;
    }

    setStatus("idle");
    setMessage("");
    setStep((current) => (current + 1) as StepId);
  };

  const goPreviousStep = () => {
    if (step <= 1) return;
    setStatus("idle");
    setMessage("");
    setStep((current) => (current - 1) as StepId);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step !== 3) {
      goNextStep();
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/client-area/consulenza-utenze/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: form.serviceType,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          customerType: form.customerType,
          businessName: form.businessName,
          vatNumber: form.vatNumber,
          currentProvider: form.currentProvider,
          monthlySpendEUR: form.monthlySpendEUR,
          city: form.city,
          bestContactTime: form.bestContactTime,
          notes: form.notes,
          privacyConsent: form.privacyConsent,
          marketingConsent: form.marketingConsent,
        }),
      });

      const raw = await response.text();
      const payload = parseApiPayload<{ message?: string }>(raw);
      if (!response.ok) {
        throw new Error(payload.message || "Invio richiesta consulenza non riuscito.");
      }

      setStatus("success");
      setMessage(
        payload.message || "Lead registrata correttamente. Ti contatteremo entro breve.",
      );
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setDraftMessage("Bozza svuotata dopo invio.");
      setForm((current) => ({
        ...buildInitialState(area),
        customerName: current.customerName,
        email: current.email,
        phone: current.phone,
      }));
      setStep(1);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Invio richiesta consulenza non riuscito.",
      );
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="lux-card rounded-3xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Lead in presa in carico
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Riepilogo consulenza</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Seleziona il servizio e inserisci i dati minimi: la richiesta viene trasformata in una
            lead reale con stato aggiornabile dal team commerciale.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Step corrente
                </p>
                <span className="text-xs font-semibold text-cyan-700">{progressPercentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-cyan-600 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2">
                {STEP_META.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        step >= item.id
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.id}
                    </span>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{item.title}</span> · {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Servizio scelto
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {selectedService?.label || "Da selezionare"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedService?.description || "Scegli il tipo di consulenza da attivare."}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Tipo cliente
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900 capitalize">
                  {form.customerType}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Spesa mensile
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {form.monthlySpendEUR ? `${form.monthlySpendEUR} €` : "Non indicata"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Risparmio stimato live
                </p>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${estimateReliability.className}`}
                >
                  Affidabilità {estimateReliability.label}
                </span>
              </div>
              {estimatedSavings ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-emerald-900">
                    Potenziale risparmio mensile: {formatEUR(estimatedSavings.monthlyMin)} - {formatEUR(estimatedSavings.monthlyMax)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-900/90">
                    Stima annuale: {formatEUR(estimatedSavings.yearlyMin)} - {formatEUR(estimatedSavings.yearlyMax)} · {estimatedSavings.label}
                  </p>
                  <p className="mt-2 text-xs font-medium text-emerald-900/80">
                    {estimateReliability.description}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-emerald-900/90">
                  Inserisci la spesa media mensile per visualizzare la stima potenziale.
                </p>
              )}

              <details className="mt-3 rounded-2xl border border-emerald-200 bg-white p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Come calcoliamo l&apos;affidabilità
                </summary>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-emerald-900/90">
                  <li>• Alta: dati quasi completi (spesa, fornitore, città e profilo).</li>
                  <li>• Media: dati principali presenti, mancano dettagli utili.</li>
                  <li>• Bassa: dati minimi, stima ancora preliminare.</li>
                </ul>
              </details>

              {missingEstimateFields.length > 0 ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                    Per migliorare la stima manca
                  </p>
                  <p className="mt-1 text-xs text-amber-900/90">
                    {missingEstimateFields.join(" · ")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <p className="text-sm font-semibold text-cyan-900">Passaggi successivi</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cyan-900/90">
              <li>La lead viene registrata con stato iniziale “Nuova”.</li>
              <li>Il team commerciale effettua il primo contatto.</li>
              <li>Riceverai aggiornamenti sul contatto e sulla proposta.</li>
            </ul>

            <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Timeline lead
              </p>
              <ol className="mt-3 space-y-2 text-sm text-cyan-900/90">
                <li>1. Nuova · richiesta registrata</li>
                <li>2. Presa in carico · verifica dati</li>
                <li>3. Contattata · primo confronto</li>
                <li>4. Proposta · offerta personalizzata</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="lux-panel rounded-3xl p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Modulo lead
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              Richiedi consulenza utenze
            </h3>
            <p className="mt-2 text-sm text-slate-600">{STEP_META[step - 1]?.description}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{draftMessage}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {step === 1 ? (
              <>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Servizio</span>
                  <select
                    value={form.serviceType}
                    onChange={(event) => update("serviceType", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                  >
                    {area.serviceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Nome e cognome</span>
                  <input
                    required
                    value={form.customerName}
                    onChange={(event) => update("customerName", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder="Inserisci nominativo"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder="nome@email.it"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Telefono</span>
                  <input
                    required
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder="Es. 3331234567"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tipo cliente</span>
                  <select
                    value={form.customerType}
                    onChange={(event) => update("customerType", event.target.value as "privato" | "azienda")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                  >
                    <option value="privato">Privato</option>
                    <option value="azienda">Azienda</option>
                  </select>
                </label>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="md:col-span-2 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                  <p className="text-sm font-semibold text-cyan-900">{stepTwoConfig.title}</p>
                  <p className="mt-1 text-sm text-cyan-900/90">{stepTwoConfig.description}</p>
                </div>

                {form.customerType === "azienda" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Ragione sociale</span>
                      <input
                        required
                        value={form.businessName}
                        onChange={(event) => update("businessName", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                        placeholder="Nome azienda"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Partita IVA</span>
                      <input
                        value={form.vatNumber}
                        onChange={(event) => update("vatNumber", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                        placeholder="Inserisci P.IVA"
                      />
                    </label>
                  </>
                ) : null}

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">{stepTwoConfig.providerLabel}</span>
                  <input
                    value={form.currentProvider}
                    onChange={(event) => update("currentProvider", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder={stepTwoConfig.providerPlaceholder}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">{stepTwoConfig.monthlySpendLabel}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthlySpendEUR}
                    onChange={(event) => update("monthlySpendEUR", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder="Es. 89.90"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">{stepTwoConfig.cityLabel}</span>
                  <input
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder={stepTwoConfig.cityPlaceholder}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">{stepTwoConfig.bestContactTimeLabel}</span>
                  <input
                    value={form.bestContactTime}
                    onChange={(event) => update("bestContactTime", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder={stepTwoConfig.bestContactTimePlaceholder}
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Note aggiuntive</span>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) => update("notes", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                    placeholder={stepTwoConfig.notesPlaceholder}
                  />
                </label>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Riepilogo finale</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {form.customerName || "Cliente"} · {selectedService?.label || "Servizio"} · {form.email || "Email"}
                  </p>
                </div>

                <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <input
                    required
                    type="checkbox"
                    checked={form.privacyConsent}
                    onChange={(event) => update("privacyConsent", event.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">
                    Confermo di aver letto l&apos;informativa privacy e autorizzo il trattamento dati per
                    la gestione della richiesta.
                  </span>
                </label>

                <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={form.marketingConsent}
                    onChange={(event) => update("marketingConsent", event.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">
                    Acconsento a ricevere offerte commerciali e aggiornamenti promozionali.
                  </span>
                </label>
              </>
            ) : null}
          </div>

          {message ? (
            <p
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={goPreviousStep}
                className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Indietro
              </button>
            ) : null}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNextStep}
                className="inline-flex rounded-full bg-cyan-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Continua
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex rounded-full bg-cyan-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Invio in corso..." : "Invia richiesta consulenza"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
