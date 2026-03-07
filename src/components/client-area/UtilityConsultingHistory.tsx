"use client";

import { useEffect, useState } from "react";

function parseApiPayload<T>(raw: string): T {
  try {
    return (raw ? JSON.parse(raw) : {}) as T;
  } catch {
    return {} as T;
  }
}

type LeadHistoryItem = {
  requestId: number;
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  customerType: string;
  businessName: string;
  vatNumber: string;
  currentProvider: string;
  monthlySpendEUR: number;
  city: string;
  bestContactTime: string;
  status: string;
  leadStatus: string;
  marketingConsent: boolean;
  createdAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatService(value: string) {
  switch (value) {
    case "telefonia":
      return "Telefonia";
    case "luce":
      return "Luce";
    case "gas":
      return "Gas";
    default:
      return value || "n/d";
  }
}

function formatLeadStatus(value: string) {
  switch (value) {
    case "nuova":
      return "Nuova";
    case "contattata":
      return "Contattata";
    case "qualificata":
      return "Qualificata";
    case "offerta":
      return "Offerta inviata";
    case "chiusa":
      return "Chiusa";
    default:
      return value || "Nuova";
  }
}

export default function UtilityConsultingHistory() {
  const [items, setItems] = useState<LeadHistoryItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/client-area/consulenza-utenze/history", {
          method: "POST",
          cache: "no-store",
        });
        const raw = await response.text();
        const payload = parseApiPayload<{
          leads?: LeadHistoryItem[];
          message?: string;
        }>(raw);

        if (!response.ok) {
          throw new Error(payload.message || "Impossibile caricare lo storico lead.");
        }

        if (!active) return;
        setItems(payload.leads || []);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Impossibile caricare lo storico lead.");
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
        <p className="text-sm font-medium text-slate-600">Sto recuperando le lead...</p>
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
          Nessuna lead registrata. Invia la prima richiesta di consulenza per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Storico lead
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Consulenza Utenze</h2>
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
              <th className="px-4 py-3 font-semibold">Operatore attuale</th>
              <th className="px-4 py-3 font-semibold">Spesa media</th>
              <th className="px-4 py-3 font-semibold">Città</th>
              <th className="px-4 py-3 font-semibold">Marketing</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.requestId} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">#{item.requestId}</p>
                  <p className="text-xs text-slate-500 capitalize">{item.customerType || "n/d"}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">{formatService(item.serviceType)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.customerName || "n/d"}</p>
                  <p className="text-xs text-slate-500">{item.email || ""}</p>
                  <p className="text-xs text-slate-500">{item.phone || ""}</p>
                  {item.businessName ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.businessName}
                      {item.vatNumber ? ` · P.IVA ${item.vatNumber}` : ""}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p>{formatLeadStatus(item.leadStatus || item.status)}</p>
                </td>
                <td className="px-4 py-3">{item.currentProvider || "Non indicato"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.monthlySpendEUR > 0 ? `${item.monthlySpendEUR.toFixed(2).replace(".", ",")} €` : "-"}
                </td>
                <td className="px-4 py-3">{item.city || "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.marketingConsent ? "Consenso" : "No consenso"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
