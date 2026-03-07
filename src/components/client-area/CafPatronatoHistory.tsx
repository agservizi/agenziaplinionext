"use client";

import { useEffect, useState } from "react";

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
        const response = await fetch("/api/client-area/caf-patronato/history", {
          method: "POST",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          requests?: CafHistoryRecord[];
          message?: string;
        };

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
      <div className="lux-panel rounded-3xl p-6">
        <p className="text-sm font-medium text-slate-600">Sto recuperando le tue pratiche...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="lux-panel rounded-3xl p-6">
        <p className="text-sm font-medium text-red-600">{message}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="lux-panel rounded-3xl p-6">
        <p className="text-sm font-medium text-slate-700">
          Non ci sono ancora pratiche salvate in questo spazio.
        </p>
      </div>
    );
  }

  return (
    <div className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Storico pratiche</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">CAF e Patronato</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {items.length} registrate
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-300 w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
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
              <tr key={item.requestId} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">#{item.requestId}</p>
                  <p className="text-xs text-slate-500">{item.serviceScope === "caf" ? "CAF" : "Patronato"}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.serviceLabel || "n/d"}</p>
                  <p className="text-xs text-slate-500">{item.categoryLabel || ""}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.customerName || "n/d"}</p>
                  <p className="text-xs text-slate-500">{item.email || ""}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p>{getStatusLabel(item.intakeStatus || item.status)}</p>
                  <p className="text-xs text-slate-500">
                    {item.operatorEmailStatus === "sent" ? "Mail inviata" : "Mail in attesa"}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.resolvedAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p>{formatMoney(item.paymentAmountCents, item.paymentCurrency)}</p>
                  <p className="text-xs text-slate-500">
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
                          className="block text-xs font-medium text-cyan-700 hover:underline"
                        >
                          {file.originalName}
                        </a>
                      ))}
                      {item.customerFiles.length > 2 ? (
                        <p className="text-xs text-slate-500">+{item.customerFiles.length - 2} altri</p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Nessuno</span>
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
                          className="block text-xs font-semibold text-cyan-700 hover:underline"
                        >
                          {file.originalName}
                        </a>
                      ))}
                      {item.resolvedFiles.length > 2 ? (
                        <p className="text-xs text-slate-500">+{item.resolvedFiles.length - 2} altri</p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Non disponibili</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-80 text-xs text-slate-600">
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
