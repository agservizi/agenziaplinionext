"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicConsultingService, publicConsultingServices } from "@/lib/public-consulting";

type Props = {
  initialService?: string;
};

type Step = 1 | 2 | 3;
const CUSTOMER_TYPE_REQUIRED_SERVICES = new Set(["telefonia", "energia", "web-agency"]);
type CustomerProfile = "privato" | "azienda";

type Step3Config = {
  objectiveLabel: string;
  objectivePlaceholder: string;
  contextLabel: string;
  contextPlaceholder: string;
  budgetLabel: string;
  budgetPlaceholder: string;
  timelineLabel: string;
  timelinePlaceholder: string;
  notesPlaceholder: string;
};

type Step3FieldKey = "objective" | "currentProvider" | "budgetRange" | "timeline" | "notes";

const STEP_LABELS = ["Servizio", "Contatto", "Dettagli"] as const;

const fieldClass =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";
const fieldErrorClass =
  "w-full border border-red-700/40 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-red-700";
const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/45";

function getStep3Config(serviceType: string, customerType: string): Step3Config {
  const profile = customerType === "azienda" ? "azienda" : "privato";
  const byProfile = (privato: string, azienda: string) => (profile === "azienda" ? azienda : privato);

  if (serviceType === "telefonia") {
    return {
      objectiveLabel: byProfile("Esigenza principale", "Obiettivo aziendale"),
      objectivePlaceholder: byProfile(
        "Ridurre la spesa o migliorare copertura/velocità?",
        "Ottimizzare costi, centralino, linee mobili o connettività sedi?",
      ),
      contextLabel: "Situazione attuale",
      contextPlaceholder: byProfile(
        "Operatore attuale, tipo linea e criticità principali",
        "Operatore attuale, numero linee/sedi e criticità operative",
      ),
      budgetLabel: "Spesa attuale",
      budgetPlaceholder: byProfile("Spesa media mensile (facoltativa)", "Spesa media mensile complessiva"),
      timelineLabel: "Tempistiche",
      timelinePlaceholder: byProfile("Quando vuoi attivare il cambio?", "Entro quando vuoi completare l'ottimizzazione?"),
      notesPlaceholder: "Indica esigenze specifiche (SIM, fibra, vincoli contrattuali, disservizi).",
    };
  }

  if (serviceType === "energia") {
    return {
      objectiveLabel: byProfile("Obiettivo fornitura", "Obiettivo energetico aziendale"),
      objectivePlaceholder: byProfile(
        "Ridurre bollette luce/gas o cambiare fornitore?",
        "Ridurre costo energia, stabilizzare tariffe o rivedere contratti multi-sede?",
      ),
      contextLabel: "Fornitura attuale",
      contextPlaceholder: byProfile(
        "Fornitore, tipo tariffa e consumi indicativi",
        "Fornitore, tipologia utenze e consumi annuali indicativi",
      ),
      budgetLabel: "Spesa energetica",
      budgetPlaceholder: byProfile("Spesa media mensile/annuale (facoltativa)", "Spesa media mensile/annuale complessiva"),
      timelineLabel: "Scadenze",
      timelinePlaceholder: byProfile("Hai una scadenza contrattuale o urgenza?", "Scadenze contrattuali o finestre di cambio"),
      notesPlaceholder: "Aggiungi informazioni utili (POD/PDR, fasce orarie, stagionalità, vincoli).",
    };
  }

  if (serviceType === "web-agency") {
    return {
      objectiveLabel: byProfile("Obiettivo progetto", "Obiettivo business"),
      objectivePlaceholder: byProfile(
        "Nuovo sito, restyling o presenza digitale personale?",
        "Lead generation, e-commerce, branding o automazione marketing?",
      ),
      contextLabel: "Contesto digitale attuale",
      contextPlaceholder: byProfile(
        "Hai già sito/social attivi? Cosa non funziona?",
        "Stack attuale (sito, CRM, ADS, analytics) e principali limiti",
      ),
      budgetLabel: "Budget progetto",
      budgetPlaceholder: byProfile("Budget indicativo disponibile", "Budget e priorità per fase"),
      timelineLabel: "Go-live desiderato",
      timelinePlaceholder: byProfile("Quando vuoi partire?", "Deadline operative o milestone previste"),
      notesPlaceholder: "Dettaglia target, concorrenti, funzionalità richieste e risultati attesi.",
    };
  }

  if (serviceType === "spedizioni") {
    return {
      objectiveLabel: "Esigenza logistica",
      objectivePlaceholder: "Ritiri ricorrenti, spedizioni occasionali o ottimizzazione flussi?",
      contextLabel: "Operatività attuale",
      contextPlaceholder: "Destinazioni, volumi medi e eventuali criticità su consegne/ritiri",
      budgetLabel: "Volume / costo attuale",
      budgetPlaceholder: "Numero spedizioni mensili o spesa logistica indicativa",
      timelineLabel: "Finestra operativa",
      timelinePlaceholder: "Da quando vuoi attivare il servizio?",
      notesPlaceholder: "Aggiungi vincoli su orari di ritiro, merce e località.",
    };
  }

  if (serviceType === "visure") {
    return {
      objectiveLabel: "Tipo di pratica",
      objectivePlaceholder: "Quale visura o documento ti serve?",
      contextLabel: "Dati disponibili",
      contextPlaceholder: "Inserisci riferimento pratica, CF/P.IVA o altri dati utili",
      budgetLabel: "Priorità pratica",
      budgetPlaceholder: "Standard o urgente",
      timelineLabel: "Scadenza richiesta",
      timelinePlaceholder: "Entro quando ti serve il documento?",
      notesPlaceholder: "Specifica dettagli e allegati che preparerai per velocizzare l'evasione.",
    };
  }

  if (serviceType === "caf-patronato") {
    return {
      objectiveLabel: "Pratica richiesta",
      objectivePlaceholder: "Quale pratica CAF/Patronato devi avviare?",
      contextLabel: "Documentazione disponibile",
      contextPlaceholder: "Quali documenti hai già pronti?",
      budgetLabel: "Livello urgenza",
      budgetPlaceholder: "Indica se ci sono scadenze fiscali/previdenziali imminenti",
      timelineLabel: "Data obiettivo",
      timelinePlaceholder: "Entro quale data vuoi completare la pratica?",
      notesPlaceholder: "Aggiungi informazioni utili su nucleo familiare, INPS, Agenzia Entrate o deleghe.",
    };
  }

  if (serviceType === "digitali") {
    return {
      objectiveLabel: "Servizio digitale richiesto",
      objectivePlaceholder: "SPID, PEC, firma digitale o supporto su rinnovo/attivazione?",
      contextLabel: "Situazione attuale",
      contextPlaceholder: "Hai già account attivi? Ci sono errori o blocchi?",
      budgetLabel: "Modalità richiesta",
      budgetPlaceholder: "Attivazione base o supporto completo guidato",
      timelineLabel: "Tempistiche",
      timelinePlaceholder: "Quando vuoi completare l'attivazione?",
      notesPlaceholder: "Indica dispositivo disponibile, documento e livello urgenza.",
    };
  }

  return {
    objectiveLabel: "Obiettivo principale",
    objectivePlaceholder: "Descrivi l'obiettivo della consulenza",
    contextLabel: "Contesto attuale",
    contextPlaceholder: "Descrivi situazione attuale o criticità",
    budgetLabel: "Budget / priorità",
    budgetPlaceholder: "Budget o priorità operativa",
    timelineLabel: "Tempistiche",
    timelinePlaceholder: "Tempistiche desiderate",
    notesPlaceholder: "Dettagli aggiuntivi",
  };
}

function getStep3RequiredFields(serviceType: string, customerType: string): Step3FieldKey[] {
  const profile = customerType === "azienda" ? "azienda" : "privato";

  if (serviceType === "telefonia") {
    return profile === "azienda"
      ? ["objective", "currentProvider", "budgetRange", "timeline"]
      : ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "energia") {
    return profile === "azienda"
      ? ["objective", "currentProvider", "budgetRange", "timeline"]
      : ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "web-agency") {
    return profile === "azienda"
      ? ["objective", "currentProvider", "budgetRange", "timeline"]
      : ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "spedizioni") {
    return ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "visure") {
    return ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "caf-patronato") {
    return ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "digitali") {
    return ["objective", "currentProvider", "timeline"];
  }
  if (serviceType === "pagamenti") {
    return ["objective", "timeline"];
  }
  return ["objective"];
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-0 border-y border-[var(--ink)]/10 px-2 py-4">
      {STEP_LABELS.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} className="flex items-center">
            {index > 0 && (
              <div className="mx-1 h-px w-8 sm:w-12 md:w-16">
                <div
                  className={`h-full transition-colors duration-300 ${
                    isCompleted || isActive ? "bg-[#5E0ED7]" : "bg-[var(--ink)]/15"
                  }`}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-[var(--ink)] text-white"
                    : isActive
                      ? "border-2 border-[#5E0ED7] text-[#5E0ED7]"
                      : "border border-[var(--ink)]/15 text-[var(--ink)]/35"
                }`}
              >
                {isCompleted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? "text-[#5E0ED7]" : isCompleted ? "text-[var(--ink)]/55" : "text-[var(--ink)]/30"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InteractiveConsultingWizard({ initialService }: Props) {
  const searchParams = useSearchParams();
  const safeInitialService = getPublicConsultingService(initialService || "")?.key || "telefonia";
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [requestCode, setRequestCode] = useState("");
  const [step3Touched, setStep3Touched] = useState<Record<Step3FieldKey, boolean>>({
    objective: false,
    currentProvider: false,
    budgetRange: false,
    timeline: false,
    notes: false,
  });
  const [form, setForm] = useState({
    serviceType: safeInitialService,
    customerType: "privato",
    customerName: "",
    email: "",
    phone: "",
    city: "",
    budgetRange: "",
    timeline: "",
    objective: "",
    currentProvider: "",
    notes: "",
  });

  useEffect(() => {
    const serviceParam = searchParams.get("service") || "";
    const serviceFromQuery = getPublicConsultingService(serviceParam)?.key;
    if (!serviceFromQuery) return;
    setForm((current) => {
      if (current.serviceType === serviceFromQuery) return current;
      return { ...current, serviceType: serviceFromQuery };
    });
  }, [searchParams]);

  const service = useMemo(() => getPublicConsultingService(form.serviceType), [form.serviceType]);
  const step3Config = useMemo(
    () => getStep3Config(form.serviceType, form.customerType as CustomerProfile),
    [form.customerType, form.serviceType],
  );
  const requiredStep3Fields = useMemo(
    () => getStep3RequiredFields(form.serviceType, form.customerType),
    [form.customerType, form.serviceType],
  );
  const requiresCustomerType = CUSTOMER_TYPE_REQUIRED_SERVICES.has(form.serviceType);
  const canStepOne =
    form.serviceType.trim() !== "" && (!requiresCustomerType || form.customerType.trim() !== "");
  const canStepTwo =
    form.customerName.trim() !== "" && form.email.includes("@") && form.phone.trim() !== "";
  const canStepThree = requiredStep3Fields.every((fieldKey) => form[fieldKey].trim() !== "");
  const isStep3FieldRequired = (field: Step3FieldKey) => requiredStep3Fields.includes(field);
  const hasStep3FieldError = (field: Step3FieldKey) =>
    isStep3FieldRequired(field) && step3Touched[field] && form[field].trim() === "";

  const update = (key: keyof typeof form, value: string) => {
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
      setRequestCode("");
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  const markStep3Touched = (field: Step3FieldKey) => {
    setStep3Touched((current) => ({ ...current, [field]: true }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (step === 1) {
      if (!canStepOne) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!canStepTwo) return;
      setStep(3);
      setStep3Touched({
        objective: false,
        currentProvider: false,
        budgetRange: false,
        timeline: false,
        notes: false,
      });
      return;
    }

    setStatus("sending");
    setMessage("");
    setRequestCode("");
    try {
      const response = await fetch("/api/public/interactive-consulting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: form.serviceType,
          customerType: form.customerType,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          notes: form.notes,
          details: {
            obiettivo: form.objective,
            fornitoreAttuale: form.currentProvider,
            budgetRange: form.budgetRange,
            timeline: form.timeline,
            focus: (service?.focusQuestions || []).join(", "),
          },
        }),
      });

      const payload = (await response.json()) as { message?: string; requestCode?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Invio richiesta non riuscito.");
      }
      setStatus("success");
      setMessage(payload.message || "Richiesta inviata correttamente.");
      setRequestCode(payload.requestCode || "");
      setStep(1);
      setForm((current) => ({
        ...current,
        customerName: "",
        email: "",
        phone: "",
        city: "",
        budgetRange: "",
        timeline: "",
        objective: "",
        currentProvider: "",
        notes: "",
      }));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Invio richiesta non riuscito.");
    }
  };

  return (
    <div className="grid gap-0 border border-[var(--ink)]/10 lg:grid-cols-[1fr_1fr]">
      <div className="border-b border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-7 lg:border-b-0 lg:border-r">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
          Consulenza interattiva
        </p>
        <h2 className="display-type mt-3 text-3xl text-[var(--ink)] md:text-4xl">
          Scegli il servizio e ricevi una consulenza su misura
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]/65">
          Flusso guidato in 3 step. Al termine inviamo conferma sia al backoffice sia alla tua email
          con codice richiesta.
        </p>

        <div className="mt-6">
          <StepIndicator currentStep={step} />
        </div>

        {requestCode ? (
          <div className="mt-5 border border-[var(--ink)]/15 bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)]">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Codice richiesta
            </span>
            <p className="mt-1 font-bold text-[var(--ink)]">{requestCode}</p>
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="bg-[var(--paper)] p-7">
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="display-type text-2xl text-[var(--ink)]">Step 1 · Servizio e profilo</h3>
            <label className="block">
              <span className={labelClass}>Servizio</span>
              <select
                value={form.serviceType}
                onChange={(event) => update("serviceType", event.target.value)}
                className={fieldClass}
              >
                {publicConsultingServices.map((entry) => (
                  <option key={entry.key} value={entry.key}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--ink)]">{service?.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink)]/60">{service?.description}</p>
            </div>
            {requiresCustomerType ? (
              <label className="block">
                <span className={labelClass}>Profilo</span>
                <select
                  value={form.customerType}
                  onChange={(event) => update("customerType", event.target.value)}
                  className={fieldClass}
                >
                  <option value="privato">Privato</option>
                  <option value="azienda">Azienda</option>
                </select>
              </label>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h3 className="display-type text-2xl text-[var(--ink)]">Step 2 · Dati contatto</h3>
            <label className="block">
              <span className={labelClass}>Nome e cognome</span>
              <input
                value={form.customerName}
                onChange={(event) => update("customerName", event.target.value)}
                placeholder="Nome e cognome"
                className={fieldClass}
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                type="email"
                placeholder="Email"
                className={fieldClass}
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Telefono</span>
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="Telefono"
                className={fieldClass}
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Città</span>
              <input
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                placeholder="Città"
                className={fieldClass}
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h3 className="display-type text-2xl text-[var(--ink)]">Step 3 · Obiettivi e dettagli</h3>
            <label className="block">
              <span className={labelClass}>
                {step3Config.objectiveLabel}
                {requiredStep3Fields.includes("objective") ? " *" : ""}
              </span>
              <input
                value={form.objective}
                onChange={(event) => update("objective", event.target.value)}
                onBlur={() => markStep3Touched("objective")}
                placeholder={step3Config.objectivePlaceholder}
                className={hasStep3FieldError("objective") ? fieldErrorClass : fieldClass}
                required={requiredStep3Fields.includes("objective")}
              />
            </label>
            {hasStep3FieldError("objective") ? (
              <p className="text-xs text-red-700">Campo obbligatorio.</p>
            ) : null}
            <label className="block">
              <span className={labelClass}>
                {step3Config.contextLabel}
                {requiredStep3Fields.includes("currentProvider") ? " *" : ""}
              </span>
              <input
                value={form.currentProvider}
                onChange={(event) => update("currentProvider", event.target.value)}
                onBlur={() => markStep3Touched("currentProvider")}
                placeholder={step3Config.contextPlaceholder}
                className={hasStep3FieldError("currentProvider") ? fieldErrorClass : fieldClass}
                required={requiredStep3Fields.includes("currentProvider")}
              />
            </label>
            {hasStep3FieldError("currentProvider") ? (
              <p className="text-xs text-red-700">Campo obbligatorio.</p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block">
                  <span className={labelClass}>
                    {step3Config.budgetLabel}
                    {requiredStep3Fields.includes("budgetRange") ? " *" : ""}
                  </span>
                  <input
                    value={form.budgetRange}
                    onChange={(event) => update("budgetRange", event.target.value)}
                    onBlur={() => markStep3Touched("budgetRange")}
                    placeholder={step3Config.budgetPlaceholder}
                    className={hasStep3FieldError("budgetRange") ? fieldErrorClass : fieldClass}
                    required={requiredStep3Fields.includes("budgetRange")}
                  />
                </label>
                {hasStep3FieldError("budgetRange") ? (
                  <p className="text-xs text-red-700">Campo obbligatorio.</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label className="block">
                  <span className={labelClass}>
                    {step3Config.timelineLabel}
                    {requiredStep3Fields.includes("timeline") ? " *" : ""}
                  </span>
                  <input
                    value={form.timeline}
                    onChange={(event) => update("timeline", event.target.value)}
                    onBlur={() => markStep3Touched("timeline")}
                    placeholder={step3Config.timelinePlaceholder}
                    className={hasStep3FieldError("timeline") ? fieldErrorClass : fieldClass}
                    required={requiredStep3Fields.includes("timeline")}
                  />
                </label>
                {hasStep3FieldError("timeline") ? (
                  <p className="text-xs text-red-700">Campo obbligatorio.</p>
                ) : null}
              </div>
            </div>
            <label className="block">
              <span className={labelClass}>
                Note
                {requiredStep3Fields.includes("notes") ? " *" : ""}
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                onBlur={() => markStep3Touched("notes")}
                rows={4}
                placeholder={step3Config.notesPlaceholder}
                className={hasStep3FieldError("notes") ? fieldErrorClass : fieldClass}
                required={requiredStep3Fields.includes("notes")}
              />
            </label>
            {hasStep3FieldError("notes") ? (
              <p className="text-xs text-red-700">Campo obbligatorio.</p>
            ) : null}
            {!canStepThree ? (
              <p className="text-xs text-[var(--ink)]/55">
                Completa i campi contrassegnati con <strong>*</strong> per continuare.
              </p>
            ) : null}
            {service?.focusQuestions?.length ? (
              <p className="text-xs text-[var(--ink)]/45">
                Focus consulenza: {service.focusQuestions.join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}

        {message ? (
          <p
            className={`mt-4 border px-3 py-2.5 text-sm font-medium ${
              status === "success"
                ? "border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] text-[var(--ink)]"
                : status === "error"
                  ? "border-red-700/25 bg-red-50 text-red-900"
                  : "border-[var(--ink)]/10 text-[var(--ink)]/70"
            }`}
          >
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => (current - 1) as Step)}
              className="inline-flex min-h-[44px] items-center border border-[var(--ink)]/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            >
              Indietro
            </button>
          ) : null}
          <button
            type="submit"
            disabled={
              (step === 1 && !canStepOne) ||
              (step === 2 && !canStepTwo) ||
              (step === 3 && !canStepThree) ||
              status === "sending"
            }
            className="brutal-cta-ink inline-flex min-h-[44px] items-center bg-[var(--ink)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step < 3 ? "Continua" : status === "sending" ? "Invio..." : "Invia richiesta"}
          </button>
        </div>
      </form>
    </div>
  );
}
