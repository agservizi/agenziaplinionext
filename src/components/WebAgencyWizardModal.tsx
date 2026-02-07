"use client";

import { useEffect, useState } from "react";
import WebAgencyWizard from "@/components/WebAgencyWizard";

export default function WebAgencyWizardModal() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setRendered(false), 200);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (open) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      root.style.overflow = "";
      body.style.overflow = "";
    }
    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Avvia un progetto
      </button>

      {rendered ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpen(false)}
          />
          <div
            className={`relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl transition duration-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Mini wizard
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Avvia il tuo progetto
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600"
                aria-label="Chiudi"
              >
                Chiudi
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <WebAgencyWizard />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
