"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { faqs } from "@/lib/faq-data";

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
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
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
                  id={`faq-panel-${i}`}
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
