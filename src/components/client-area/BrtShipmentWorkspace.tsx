"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ClientAreaConfig } from "@/lib/client-area";
import BrtShipmentForm, { type BrtShipmentLiveSummary } from "@/components/client-area/BrtShipmentForm";
import {
  fetchPublicShippingPricing,
  type PublicShippingPricingRule,
} from "@/lib/shipping-pricing";

type BrtShipmentWorkspaceProps = {
  area: ClientAreaConfig;
};

function buildInitialSummary(area: ClientAreaConfig): BrtShipmentLiveSummary {
  return {
    serviceLabel: area.serviceOptions[0]?.label || "Spedizione",
    destinationCountry: "IT",
    parcelCount: 1,
    actualWeightKG: 1,
    volumetricWeightKG: 0.25,
    taxableWeightKG: 1,
    volumeM3: 0.001,
    dimensionsLabel: "10 x 10 x 10 cm",
    pudoSelected: false,
    estimatedCostLabel: "7,90 - 9,90 euro",
  };
}

export default function BrtShipmentWorkspace({ area }: BrtShipmentWorkspaceProps) {
  const [summary, setSummary] = useState<BrtShipmentLiveSummary>(() => buildInitialSummary(area));
  const [pricingRules, setPricingRules] = useState<PublicShippingPricingRule[]>([]);
  const [pricingMessage, setPricingMessage] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const rules = await fetchPublicShippingPricing();
        if (!active) return;
        setPricingRules(rules);
        setPricingMessage("");
      } catch (error) {
        if (!active) return;
        setPricingMessage(
          error instanceof Error ? error.message : "Listino dinamico non disponibile.",
        );
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const matchedRule = useMemo(() => {
    const sortedRules = [...pricingRules].sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.minWeightKG - right.minWeightKG;
    });

    return (
      sortedRules.find((rule) => {
        const weightMatches =
          summary.taxableWeightKG >= rule.minWeightKG &&
          (rule.maxWeightKG <= 0 || summary.taxableWeightKG <= rule.maxWeightKG);
        const volumeMatches =
          summary.volumeM3 >= rule.minVolumeM3 &&
          (rule.maxVolumeM3 <= 0 || summary.volumeM3 <= rule.maxVolumeM3);

        return rule.active && weightMatches && volumeMatches;
      }) || null
    );
  }, [pricingRules, summary.taxableWeightKG, summary.volumeM3]);

  const resolvedCostLabel = matchedRule
    ? `${matchedRule.priceEUR.toFixed(2).replace(".", ",")} euro`
    : summary.estimatedCostLabel;

  return (
    <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
      <div className="lux-card rounded-3xl p-6">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Riepilogo live
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              Spedizione aggiornata mentre compili
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Il pannello segue il form: peso tassabile, volume e fascia costo si aggiornano in tempo reale.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Dati attuali</p>
            <div className="mt-3 space-y-2 text-sm text-cyan-900">
              <p>
                Servizio: <strong>{summary.serviceLabel}</strong>
              </p>
              <p>
                Dimensioni: <strong>{summary.dimensionsLabel}</strong>
              </p>
              <p>
                Colli: <strong>{summary.parcelCount}</strong>
              </p>
              <p>
                Destinazione: <strong>{summary.destinationCountry}</strong>
              </p>
              <p>
                Punto BRT PUDO: <strong>{summary.pudoSelected ? "selezionato" : "non selezionato"}</strong>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Calcolo BRT ufficiale</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                Formula: <strong className="text-slate-900">L x H x P / 4000</strong>
              </p>
              <p>
                Peso reale: <strong className="text-slate-900">{summary.actualWeightKG} kg</strong>
              </p>
              <p>
                Peso volumetrico: <strong className="text-slate-900">{summary.volumetricWeightKG} kg</strong>
              </p>
              <p>
                Peso tassabile: <strong className="text-slate-900">{summary.taxableWeightKG} kg</strong>
              </p>
              <p>
                Volume totale: <strong className="text-slate-900">{summary.volumeM3} m3</strong>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
            <p className="text-sm font-semibold">Costo indicativo live</p>
            <p className="mt-3 text-2xl font-semibold">{resolvedCostLabel}</p>
            {matchedRule ? (
              <p className="mt-2 text-sm text-slate-300">
                {`Sto applicando il listino impostato in area admin: ${matchedRule.label}.`}
              </p>
            ) : null}
            {pricingMessage ? (
              <p className="mt-2 text-xs font-medium text-amber-200">{pricingMessage}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Output operativo</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• compili i dati completi della spedizione e controlli subito pesi, volume e costo stimato</li>
              <li>• al click su crea spedizione vieni reindirizzato al checkout Stripe per il pagamento</li>
              <li>• dopo pagamento confermato, la spedizione viene creata con tracking, parcel ID ed etichetta PDF</li>
              <li>• se il pagamento viene annullato, la spedizione non viene creata e puoi riprendere dal form</li>
            </ul>
          </div>

          <Link
            href="/area-clienti/spedizioni/storico"
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            Vedi lo storico spedizioni
          </Link>
        </div>
      </div>

      <BrtShipmentForm area={area} pricingRules={pricingRules} onSummaryChange={setSummary} />
    </div>
  );
}
