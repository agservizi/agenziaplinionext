"use client";

import { useMemo, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

const projectTypes = [
  "Sito vetrina premium",
  "E-commerce",
  "Landing ad alta conversione",
  "Gestionale web",
  "Rebranding UI/UX",
];

const budgets = ["1-3k", "3-7k", "7-15k", "15k+"];

const timelines = ["Urgente (2-4 settimane)", "1-2 mesi", "3-4 mesi", "Da pianificare"];

export default function WebAgencyWizard() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [goals, setGoals] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const canGoNext = useMemo(() => {
    if (step === 0) return Boolean(projectType && budget);
    if (step === 1) return Boolean(timeline && goals.trim());
    if (step === 2) return Boolean(name.trim() && email.trim());
    return false;
  }, [budget, email, goals, name, projectType, step, timeline]);

  function handleBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    if (!canGoNext) return;
    setStep((prev) => Math.min(2, prev + 1));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading" || !canGoNext) return;
    setState("loading");
    setMessage("");

    const payload = {
      name,
      email,
      service: `Web Agency - ${projectType}`,
      message: [
        `Tipo progetto: ${projectType}`,
        `Budget: ${budget}`,
        `Tempistiche: ${timeline}`,
        "",
        `Obiettivi: ${goals}`,
      ].join("\n"),
    };

    try {
      const response = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Invio non riuscito");
      }

      setState("success");
      setMessage("Brief inviato con successo. Ti ricontatteremo a breve.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Si è verificato un errore. Riprova più tardi.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {["01", "02", "03"].map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span
              className={
                index <= step
                  ? "flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white"
                  : "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-400"
              }
            >
              {item}
            </span>
            {index < 2 ? <span className="h-px w-6 bg-slate-200" /> : null}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Tipo progetto</p>
            <div className="grid gap-3">
              {projectTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setProjectType(item)}
                  className={
                    projectType === item
                      ? "rounded-2xl border border-cyan-500 bg-cyan-50 px-4 py-3 text-left text-sm font-semibold text-cyan-700"
                      : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Budget indicativo</p>
            <div className="grid gap-3">
              {budgets.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBudget(item)}
                  className={
                    budget === item
                      ? "rounded-2xl border border-cyan-500 bg-cyan-50 px-4 py-3 text-left text-sm font-semibold text-cyan-700"
                      : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Tempistiche</p>
            <div className="grid gap-3">
              {timelines.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTimeline(item)}
                  className={
                    timeline === item
                      ? "rounded-2xl border border-cyan-500 bg-cyan-50 px-4 py-3 text-left text-sm font-semibold text-cyan-700"
                      : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="space-y-2 text-sm text-slate-700">
            Obiettivi e funzionalità desiderate
            <textarea
              name="goals"
              required
              value={goals}
              onChange={(event) => setGoals(event.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Nome e cognome
            <input
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Email
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            />
          </label>
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Il tuo brief verrà inviato al team AG SERVIZI. Ti risponderemo con una proposta personalizzata.
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
            >
              Indietro
            </button>
          ) : null}
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continua
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canGoNext || state === "loading"}
              className="rounded-full bg-cyan-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-400"
            >
              {state === "loading" ? "Invio..." : "Invia brief"}
            </button>
          )}
        </div>
        {message ? (
          <p className={state === "success" ? "text-sm text-emerald-600" : "text-sm text-rose-600"}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
