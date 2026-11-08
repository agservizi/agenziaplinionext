"use client";

import { useEffect, useState } from "react";
import { getClientPortalToken } from "@/lib/client-portal-auth";

type CafHistoryRecord = {
  requestId: number;
  customerName: string;
  email: string;
  serviceLabel: string;
  categoryLabel: string;
  serviceScope: string;
  status: string;
  intakeStatus: string;
  operatorEmailStatus: string;
  operatorNotes: string;
  resolvedAt: string | null;
  paymentAmountCents: number;
  paymentCurrency: string;
  priceLabel: string;
  paymentStatus: string;
  createdAt: string;
  customerFiles: Array<{
    originalName: string;
    downloadUrl: string;
  }>;
  resolvedFiles: Array<{
    originalName: string;
    downloadUrl: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "In attesa";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Evasa";
    case "processing":
      return "In lavorazione";
    case "waiting-documents":
      return "In attesa documenti";
    case "awaiting_review":
      return "Da prendere in carico";
    default:
      return status || "Nuova";
  }
}

function formatMoney(amountCents: number, currency: string) {
  if (!amountCents) return "Non disponibile";
  return `${(amountCents / 100).toFixed(2).replace(".", ",")} ${String(
    currency || "EUR",
  ).toUpperCase()}`;
}

export default function CafPatronatoHistory() {
  const [items, setItems] = useState<CafHistoryRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        // Callers: /area-clienti/caf-patronato/storico. API: POST /api/client-area/caf-patronato/history.
        // User: "Unexpected token 'I', \"Internal S\"... is not valid JSON"
        const response = await fetch("/api/client-area/caf-patronato/history", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: getClientPortalToken() }),
        });
        const raw = await response.text();
        let payload: { requests?: CafHistoryRecord[]; message?: string } = {};
        try {
          payload = raw ? (JSON.parse(raw) as typeof payload) : {};
        } catch {
          throw new Error(
            response.ok
              ? "Risposta storico non valida."
              : raw.slice(0, 140) || "Impossibile caricare lo storico pratiche.",
          );
        }

        if (!response.ok) {
          throw new Error(payload.message || "Impossibile caricare lo storico pratiche.");
        }

        if (!active) return;
        setItems(payload.requests || []);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Impossibile caricare lo storico pratiche.",
        );
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6">
        <p className="text-sm font-medium text-[var(--ink)]/55">Sto recuperando le tue pratiche...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6">
        <p className="text-sm font-medium text-red-600">{message}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6">
        <p className="text-sm font-medium text-[var(--ink)]">
          Non ci sono ancora pratiche salvate in questo spazio.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--ink)]/12 bg-[var(--paper)] p-6 md:p-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Storico pratiche</p>
          <h2 className="display-type mt-2 text-2xl text-[var(--ink)]">CAF e Patronato</h2>
        </div>
        <span className="border border-[var(--ink)]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
          {items.length} registrate
        </span>
      </div>

      <div className="overflow-x-auto border border-[var(--ink)]/12 bg-[var(--paper)]">
        <table className="min-w-300 w-full text-left text-sm text-[var(--ink)]">
          <thead className="bg-[color-mix(in_srgb,var(--paper)_90%,white)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/45">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Servizio</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Stato</th>
              <th className="px-4 py-3 font-semibold">Chiusura</th>
              <th className="px-4 py-3 font-semibold">Pagamento</th>
              <th className="px-4 py-3 font-semibold">Doc. cliente</th>
              <th className="px-4 py-3 font-semibold">Doc. evasi</th>
              <th className="px-4 py-3 font-semibold">Nota operativa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.requestId} className="border-t border-[var(--ink)]/12 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--ink)]">#{item.requestId}</p>
                  <p className="text-xs text-[var(--ink)]/45">{item.serviceScope === "caf" ? "CAF" : "Patronato"}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--ink)]">{item.serviceLabel || "n/d"}</p>
                  <p className="text-xs text-[var(--ink)]/45">{item.categoryLabel || ""}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--ink)]">{item.customerName || "n/d"}</p>
                  <p className="text-xs text-[var(--ink)]/45">{item.email || ""}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p>{getStatusLabel(item.intakeStatus || item.status)}</p>
                  <p className="text-xs text-[var(--ink)]/45">
                    {item.operatorEmailStatus === "sent" ? "Mail inviata" : "Mail in attesa"}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.resolvedAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p>{formatMoney(item.paymentAmountCents, item.paymentCurrency)}</p>
                  <p className="text-xs text-[var(--ink)]/45">
                    {item.priceLabel || (item.paymentStatus ? `Pagamento ${item.paymentStatus}` : "In attesa")}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {item.customerFiles.length ? (
                    <div className="space-y-1">
                      {item.customerFiles.slice(0, 2).map((file) => (
                        <a
                          key={`${item.requestId}-${file.downloadUrl}`}
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs font-medium text-[#5E0ED7] hover:underline"
                        >
                          {file.originalName}
                        </a>
                      ))}
                      {item.customerFiles.length > 2 ? (
                        <p className="text-xs text-[var(--ink)]/45">+{item.customerFiles.length - 2} altri</p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--ink)]/45">Nessuno</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.resolvedFiles.length ? (
                    <div className="space-y-1">
                      {item.resolvedFiles.slice(0, 2).map((file) => (
                        <a
                          key={`${item.requestId}-${file.downloadUrl}`}
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs font-semibold text-[#5E0ED7] hover:underline"
                        >
                          {file.originalName}
                        </a>
                      ))}
                      {item.resolvedFiles.length > 2 ? (
                        <p className="text-xs text-[var(--ink)]/45">+{item.resolvedFiles.length - 2} altri</p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--ink)]/45">Non disponibili</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-80 text-xs text-[var(--ink)]/55">
                  {item.operatorNotes || "Nessuna nota"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
