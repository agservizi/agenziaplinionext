"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { company } from "@/lib/site-data";

type ContactScenario = {
  id: string;
  label: string;
  title: string;
  description: string;
  service: string;
  defaultMessage: string;
  eta: string;
  highlights: string[];
};

const scenarios: ContactScenario[] = [
  {
    id: "telefonia",
    label: "Telefonia",
    title: "Attiva o cambia offerta telefonica",
    description:
      "Ti guidiamo tra mobile e fibra con confronto pratico delle opzioni e supporto in ogni passaggio.",
    service: "Iliad Space",
    defaultMessage:
      "Ciao, vorrei una consulenza per telefonia mobile/fibra e valutare la soluzione piu adatta.",
    eta: "Risposta stimata entro 2 ore lavorative",
    highlights: ["Analisi profilo consumo", "Confronto offerte", "Attivazione assistita"],
  },
  {
    id: "pagamenti",
    label: "Pagamenti",
    title: "Gestione pagamenti e pratiche veloci",
    description:
      "Supporto rapido su F24, pagoPA, bollettini e operazioni ricorrenti con istruzioni chiare.",
    service: "F24",
    defaultMessage:
      "Ciao, ho bisogno di supporto per un pagamento/pratica e vorrei capire tempi e documenti necessari.",
    eta: "Risposta stimata entro 1 ora lavorativa",
    highlights: ["Checklist documenti", "Conferma importi", "Assistenza immediata"],
  },
  {
    id: "digitale",
    label: "SPID e Digitale",
    title: "Identita digitale e servizi online",
    description:
      "Attiviamo SPID, PEC e firma digitale con assistenza operativa completa fino all'esito finale.",
    service: "SPID",
    defaultMessage:
      "Ciao, vorrei attivare servizi digitali (SPID/PEC/Firma) con assistenza in sede.",
    eta: "Risposta stimata in giornata",
    highlights: ["Attivazione guidata", "Verifica requisiti", "Supporto post-attivazione"],
  },
  {
    id: "web",
    label: "Web Agency",
    title: "Progetto sito web o gestionale",
    description:
      "Definiamo obiettivi, struttura e priorita per avviare un progetto digitale orientato ai risultati.",
    service: "Realizzazione siti web",
    defaultMessage:
      "Ciao, vorrei una consulenza per un progetto web e ricevere una proposta su misura.",
    eta: "Contatto preliminare entro 24 ore",
    highlights: ["Analisi obiettivi", "Roadmap operativa", "Stima tempi e budget"],
  },
];

const whatsappBase = "https://wa.me/393773798570";

export default function ContactInteractiveSection() {
  const [selectedId, setSelectedId] = useState(scenarios[0].id);

  const activeScenario = useMemo(
    () => scenarios.find((item) => item.id === selectedId) ?? scenarios[0],
    [selectedId],
  );

  const whatsappMessage = `Ciao, ti contatto dal sito per: ${activeScenario.title}.`;
  const whatsappLink = `${whatsappBase}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Scegli la tua esigenza</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedId(scenario.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-cyan-400 bg-cyan-50 text-cyan-900 shadow-[0_10px_30px_rgba(14,165,233,0.2)]"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/60"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em]">{scenario.label}</p>
                <p className="mt-1 text-sm font-semibold">{scenario.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <div className="lux-panel rounded-3xl p-6">
          <div className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-800">{activeScenario.title}</p>
            <p className="mt-1 text-sm text-slate-700">{activeScenario.description}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">{activeScenario.eta}</p>
          </div>

          <ContactForm
            key={activeScenario.id}
            tone="light"
            initialService={activeScenario.service}
            initialMessage={activeScenario.defaultMessage}
            submitLabel="Invia richiesta prioritaria"
          />
        </div>

        <div className="space-y-6">
          <div className="lux-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Canali rapidi</p>
            <div className="mt-4 grid gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Apri WhatsApp con messaggio precompilato
              </a>
              <a
                href="tel:+393773798570"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Chiama ora: +39 377 379 8570
              </a>
              <Link
                href="/prenota"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Prenota appuntamento in sede
              </Link>
            </div>
          </div>

          <div className="lux-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Percorso assistito</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {activeScenario.highlights.map((item, index) => (
                <li key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lux-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Dove siamo</p>
            <p className="mt-2 text-sm text-slate-700">{company.address}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <iframe
                title="Mappa AG SERVIZI"
                src="https://www.google.com/maps?q=Via%20Plinio%20il%20Vecchio%2072%2C%2080053%20Castellammare%20di%20Stabia%20(NA)&output=embed"
                className="h-56 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {company.googleBusinessUrl ? (
              <Link
                href={company.googleBusinessUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Apri navigazione su Google Maps
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
