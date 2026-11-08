"use client";

import { useEffect, useState } from "react";
import { getClientPortalToken } from "@/lib/client-portal-auth";

type VisuraHistoryItem = {
  id: number;
  customerName: string;
  email: string;
  serviceType: string;
  status: string;
  createdAt: string;
  provider: string;
  providerService: string;
  providerRequestId: string;
  providerStatus: string;
  documentUrl: string;
  paymentAmountCents: number;
  paymentCurrency: string;
  priceLabel: string;
  paymentStatus: string;
  summary: Record<string, unknown>;
};

function formatProviderStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "awaiting_manual_fulfillment") return "Presa in carico";
  if (normalized === "waiting-documents") return "In attesa documenti";
  if (normalized === "completed") return "Evasa";
  if (normalized === "processing") return "In lavorazione";
  return status || "processing";
}

export default function OpenApiVisureHistory() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [visure, setVisure] = useState<VisuraHistoryItem[]>([]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setStatus("loading");
      setMessage("");

      try {
        // Callers: /area-clienti/visure/storico. API: POST /api/client-area/visure/history.
        // User: "Unexpected token 'I', \"Internal S\"... is not valid JSON"
        const response = await fetch("/api/client-area/visure/history", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: getClientPortalToken(),
          }),
        });
        const raw = await response.text();
        let payload: { visure?: VisuraHistoryItem[]; message?: string } = {};
        try {
          payload = raw ? (JSON.parse(raw) as typeof payload) : {};
        } catch {
          throw new Error(
            response.ok
              ? "Risposta storico non valida."
              : raw.slice(0, 140) || "Storico visure non disponibile.",
          );
        }

        if (!response.ok) {
          throw new Error(payload.message || "Storico visure non disponibile.");
        }

        if (!active) return;
        setVisure(Array.isArray(payload.visure) ? payload.visure : []);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento storico.");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
            Storico Visure
          </p>
          <h2 className="mt-2 display-type text-2xl text-[var(--ink)]">Le visure gia richieste</h2>
          <p className="mt-2 text-sm text-[var(--ink)]/55">
            Qui trovi le ultime richieste inviate, con stato, riferimento e documento se
            disponibile.
          </p>
        </div>
        {status === "ready" ? (
          <span className="border border-[var(--ink)]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
            {visure.length} registrate
          </span>
        ) : null}
      </div>

      {status === "loading" ? <p className="mt-6 text-sm text-[var(--ink)]/45">Sto caricando lo storico...</p> : null}
      {status === "error" ? <p className="mt-6 text-sm font-medium text-red-600">{message}</p> : null}

      {status === "ready" && visure.length === 0 ? (
        <div className="mt-6 border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 text-sm text-[var(--ink)]/55">
          Non ci sono ancora visure registrate. Appena ne richiedi una, la ritrovi qui.
        </div>
      ) : null}

      {status === "ready" && visure.length > 0 ? (
        <div className="mt-6 overflow-x-auto border border-[var(--ink)]/12 bg-[var(--paper)]">
          <table className="min-w-300 w-full text-left text-sm text-[var(--ink)]/70">
            <thead className="bg-[color-mix(in_srgb,var(--paper)_90%,white)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/45">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Servizio</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Stato</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Stato provider</th>
                <th className="px-4 py-3 font-semibold">Riferimento</th>
                <th className="px-4 py-3 font-semibold">Documento</th>
                <th className="px-4 py-3 font-semibold">Importo</th>
                <th className="px-4 py-3 font-semibold">Riepilogo</th>
              </tr>
            </thead>
            <tbody>
              {visure.map((item) => (
                <tr key={item.id} className="border-t border-[var(--ink)]/12 align-top">
                  <td className="px-4 py-3 font-semibold text-[var(--ink)]">{item.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("it-IT") : "n/d"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.providerService || item.serviceType || "n/d"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--ink)]">{item.customerName || "n/d"}</p>
                    <p className="text-xs text-[var(--ink)]/45">{item.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.status || "new"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.provider || "n/d"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatProviderStatus(item.providerStatus || "processing")}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.providerRequestId || "n/d"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.documentUrl ? (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-xs font-semibold text-[#5E0ED7]"
                      >
                        Apri documento
                      </a>
                    ) : (
                      "Non disponibile"
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.paymentAmountCents
                      ? `${(item.paymentAmountCents / 100).toFixed(2).replace(".", ",")} ${item.paymentCurrency.toUpperCase()}`
                      : "n/d"}
                    <p className="text-xs text-[var(--ink)]/45">{item.priceLabel || item.paymentStatus || "Pagamento registrato"}</p>
                  </td>
                  <td className="px-4 py-3 max-w-80">
                    {item.summary && Object.keys(item.summary).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(item.summary).slice(0, 3).map(([key, value]) => (
                          <p key={key} className="text-xs text-[var(--ink)]/55">
                            <strong className="text-[var(--ink)]">{key}:</strong> {String(value)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--ink)]/45">Nessun dato</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
