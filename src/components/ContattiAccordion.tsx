"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "Quanto costa la consulenza?",
    a: "Zero. La consulenza è gratis, sempre. Vieni, ti spieghiamo tutto senza impegno e senza sorprese.",
  },
  {
    q: "Devo prenotare per venire in sede?",
    a: "No. Puoi venire direttamente durante gli orari di apertura: Lun–Ven 08:45–13:20 / 16:20–19:00, Sabato 09:20–12:30. Se vuoi essere sicuro di trovarci liberi, scrivici su WhatsApp prima.",
  },
  {
    q: "Quanto tempo ci vuole per fare lo SPID?",
    a: "20 minuti in sede con un documento d'identità valido e tesserino sanitario. Esci dall'agenzia con lo SPID attivo.",
  },
  {
    q: "Gestite anche i pagamenti di bollette e F24?",
    a: "Sì. Bollettini, F24, pagoPA, MAV, RAV, bollo auto e molto altro. Puoi portarci direttamente la stampa e la gestiamo in pochi minuti.",
  },
  {
    q: "Fate assistenza dopo l'acquisto o l'attivazione?",
    a: "Sì. Il nostro numero è sempre disponibile durante gli orari di apertura. Non spariscano dopo la firma: se c'è un problema, lo risolviamo.",
  },
  {
    q: "Realizzate siti web anche per piccole attività?",
    a: "Certo. Abbiamo pacchetti per ogni tipo di business: landing page per presentarsi online, siti completi con gestione contenuti, e-commerce, gestionali. Ti diciamo i costi in anticipo, senza sorprese.",
  },
];

export default function ContattiAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-100">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left transition hover:text-cyan-700"
            >
              <span className="text-base font-bold text-slate-900">{faq.q}</span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                  isOpen
                    ? "border-cyan-400 bg-cyan-500 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  fill="none"
                >
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-14 text-sm leading-relaxed text-slate-600">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
