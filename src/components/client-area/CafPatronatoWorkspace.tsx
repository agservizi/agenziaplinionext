"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CafPatronatoRequestForm from "@/components/client-area/CafPatronatoRequestForm";
import {
  CAF_PATRONATO_CATALOG,
  getCafPatronatoScopeLabel,
  getCafPatronatoService,
  type CafPatronatoScope,
} from "@/lib/caf-patronato-catalog";
import { fetchPublicCafPatronatoPricing } from "@/lib/caf-patronato-pricing-public";
import type { CafPatronatoPricingRule } from "@/lib/caf-patronato-pricing-engine";

export default function CafPatronatoWorkspace() {
  const [activePanel, setActivePanel] = useState<"setup" | "services">("setup");
  const [summary, setSummary] = useState({
    scope: "caf" as CafPatronatoScope,
    serviceType: CAF_PATRONATO_CATALOG[0]?.services[0]?.value || "",
    serviceLabel: "Scegli il servizio da cui partire",
    categoryLabel: "La categoria si aggiorna insieme al servizio",
    filesCount: 0,
    preferredContact: "",
    urgency: "Da definire",
  });
  const [pricingRules, setPricingRules] = useState<CafPatronatoPricingRule[]>([]);

  const groupedCatalog = useMemo(
    () => ({
      caf: CAF_PATRONATO_CATALOG.filter((category) => category.scope === "caf"),
      patronato: CAF_PATRONATO_CATALOG.filter((category) => category.scope === "patronato"),
    }),
    [],
  );
  const pricingMap = useMemo(
    () =>
      new Map(
        pricingRules
          .filter((rule) => rule.active)
          .map((rule) => [rule.serviceType, rule] as const),
      ),
    [pricingRules],
  );
  const selectedService = useMemo(
    () => getCafPatronatoService(summary.serviceType),
    [summary.serviceType],
  );
  const selectedPricingRule = pricingMap.get(summary.serviceType) || null;
  const selectedPriceText = (
    selectedPricingRule?.priceEUR ??
    selectedService?.priceEUR ??
    0
  )
    .toFixed(2)
    .replace(".", ",");

  useEffect(() => {
    let active = true;

    async function loadPricing() {
      try {
        const rules = await fetchPublicCafPatronatoPricing();
        if (!active) return;
        setPricingRules(rules);
      } catch {
        if (!active) return;
        setPricingRules([]);
      }
    }

    void loadPricing();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-10">
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="lux-card rounded-3xl p-4 md:p-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-3">
              <div className="grid grid-cols-2 gap-2 rounded-3xl border border-slate-200 bg-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => setActivePanel("setup")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    activePanel === "setup"
                      ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  Impostazione pratica
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("services")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    activePanel === "services"
                      ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  Servizi disponibili
                </button>
              </div>

              {activePanel === "setup" ? (
                <div className="p-3 md:p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                    Impostazione pratica
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    Riepilogo chiaro della pratica che stai aprendo
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Qui vedi subito come stai impostando la richiesta: ambito, servizio scelto,
                    quanti documenti hai già allegato e come preferisci essere ricontattato.
                  </p>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Ambito attivo
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {getCafPatronatoScopeLabel(summary.scope)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{summary.categoryLabel}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Servizio selezionato
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {summary.serviceLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Prezzo attivo: {selectedPriceText} €{" "}
                        <span className="font-medium text-slate-500">
                          · {selectedPricingRule?.label || "Prezzo base del catalogo"}
                        </span>
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Allegati pronti
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                          {summary.filesCount}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Documenti caricati nel form</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Urgenza
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {summary.urgency}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          La priorità viene mostrata subito in presa in carico
                        </p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Contatto preferito
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {summary.preferredContact || "Lo decidi dal modulo quando vuoi"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
                    <p className="text-sm font-semibold text-cyan-900">Cosa succede appena invii</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-cyan-900/90">
                      <li>Riceviamo subito la tua richiesta con i documenti che hai allegato.</li>
                      <li>Il patronato riceve una mail operativa con un link diretto alla pratica.</li>
                      <li>
                        Quando la lavorazione è chiusa, il documento evaso compare nel tuo storico.
                      </li>
                    </ul>
                    <div className="mt-4">
                      <Link
                        href="/area-clienti/caf-patronato/storico"
                        className="inline-flex rounded-full border border-cyan-200 bg-white px-5 py-2.5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                      >
                        Vedi lo storico pratiche
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 md:p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                    Servizi disponibili
                  </p>
                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">🧾 Servizi CAF</h3>
                      {groupedCatalog.caf.map((category) => (
                        <div
                          key={category.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {category.icon} {category.title}
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {category.services.map((service) => (
                              <li
                                key={service.value}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2"
                              >
                                <span>{service.label}</span>
                                <span className="shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-900">
                                  {(pricingMap.get(service.value)?.priceEUR ?? service.priceEUR)
                                    .toFixed(2)
                                    .replace(".", ",")} €
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">🏛️ Servizi Patronato</h3>
                      {groupedCatalog.patronato.map((category) => (
                        <div
                          key={category.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {category.icon} {category.title}
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {category.services.map((service) => (
                              <li
                                key={service.value}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2"
                              >
                                <span>{service.label}</span>
                                <span className="shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-900">
                                  {(pricingMap.get(service.value)?.priceEUR ?? service.priceEUR)
                                    .toFixed(2)
                                    .replace(".", ",")} €
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <CafPatronatoRequestForm onSummaryChange={setSummary} />
      </div>
    </section>
  );
}
