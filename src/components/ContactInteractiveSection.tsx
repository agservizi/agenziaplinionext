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

const fieldOverrides =
  "[&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none " +
  "[&_input]:border-[var(--ink)]/15 [&_select]:border-[var(--ink)]/15 [&_textarea]:border-[var(--ink)]/15 " +
  "[&_input]:bg-[color-mix(in_srgb,var(--paper)_92%,white)] [&_select]:bg-[color-mix(in_srgb,var(--paper)_92%,white)] [&_textarea]:bg-[color-mix(in_srgb,var(--paper)_92%,white)] " +
  "[&_input]:text-[var(--ink)] [&_select]:text-[var(--ink)] [&_textarea]:text-[var(--ink)] " +
  "[&_input]:focus:border-[#5E0ED7] [&_select]:focus:border-[#5E0ED7] [&_textarea]:focus:border-[#5E0ED7] " +
  "[&_label]:text-[var(--ink)]/70 " +
  "[&_button[type=submit]]:rounded-none [&_button[type=submit]]:bg-[var(--ink)] [&_button[type=submit]]:font-bold " +
  "[&_button[type=submit]]:uppercase [&_button[type=submit]]:tracking-[0.18em] [&_button[type=submit]]:text-white " +
  "[&_button[type=submit]]:hover:bg-[#5E0ED7]";

export default function ContactInteractiveSection() {
  const [selectedId, setSelectedId] = useState(scenarios[0].id);

  const activeScenario = useMemo(
    () => scenarios.find((item) => item.id === selectedId) ?? scenarios[0],
    [selectedId],
  );

  const whatsappMessage = `Ciao, ti contatto dal sito per: ${activeScenario.title}.`;
  const whatsappLink = `${whatsappBase}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-8 text-[var(--ink)]">
      <div className="border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
          Scegli la tua esigenza
        </p>
        <div className="mt-4 grid gap-px bg-[var(--ink)]/10 md:grid-cols-4">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedId(scenario.id)}
                className={`border border-[var(--ink)]/10 px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#5E0ED7] bg-[var(--ink)] text-white"
                    : "bg-[var(--paper)] text-[var(--ink)] hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                    isActive ? "text-white/55" : "text-[var(--ink)]/40"
                  }`}
                >
                  {scenario.label}
                </p>
                <p className={`mt-1 text-sm font-semibold ${isActive ? "text-white" : ""}`}>
                  {scenario.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <div className={`border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6 ${fieldOverrides}`}>
          <div className="mb-5 border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">{activeScenario.title}</p>
            <p className="mt-1 text-sm text-[var(--ink)]/65">{activeScenario.description}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E0ED7]">
              {activeScenario.eta}
            </p>
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
          <div className="border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
              Canali rapidi
            </p>
            <div className="mt-4 grid gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="brutal-cta-ink border border-[var(--ink)]/10 bg-[var(--ink)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7]"
              >
                Apri WhatsApp con messaggio precompilato
              </a>
              <a
                href="tel:+393773798570"
                className="border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Chiama ora: +39 377 379 8570
              </a>
              <Link
                href="/prenota"
                className="border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Prenota appuntamento in sede
              </Link>
            </div>
          </div>

          <div className="border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
              Percorso assistito
            </p>
            <ul className="mt-4 space-y-0 border border-[var(--ink)]/10">
              {activeScenario.highlights.map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-[var(--ink)]/10 px-3 py-2.5 last:border-b-0"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--ink)]/15 bg-[var(--ink)] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm text-[var(--ink)]/75">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
              Dove siamo
            </p>
            <p className="mt-2 text-sm text-[var(--ink)]/70">{company.address}</p>
            <div className="mt-4 overflow-hidden border border-[var(--ink)]/10 bg-[var(--paper)]">
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
                className="brutal-cta-ink mt-4 inline-flex min-h-[44px] items-center justify-center bg-[var(--ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
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
