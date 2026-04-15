"use client";

import { useEffect, useState } from "react";
import { getClientPortalToken } from "@/lib/client-portal-auth";

type PhotocopyHistoryItem = {
  id: number;
  requestId: number;
  customerName: string;
  email: string;
  pdfFileName: string;
  pdfUrl: string;
  pageCount: number;
  amountCents: number;
  currency: string;
  paymentStatus: string;
  checkoutStatus: string;
  requestStatus: string;
  priceLabel: string;
  createdAt: string | null;
};

function formatMoney(amountCents: number, currency: string) {
  return `${(amountCents / 100).toFixed(2).replace(".", ",")} ${String(currency || "EUR").toUpperCase()}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function PhotocopyHistory() {
  const [items, setItems] = useState<PhotocopyHistoryItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/client-area/fotocopie/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ token: getClientPortalToken() }),
        });
        const payload = (await response.json()) as { orders?: PhotocopyHistoryItem[]; message?: string };
        if (!response.ok) {
          throw new Error(payload.message || "Impossibile caricare lo storico fotocopie.");
        }
        if (!active) return;
        setItems(Array.isArray(payload.orders) ? payload.orders : []);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Impossibile caricare lo storico fotocopie.");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="lux-panel rounded-3xl p-6"><p className="text-sm text-slate-600">Sto caricando gli ordini fotocopie...</p></div>;
  }

  if (status === "error") {
    return <div className="lux-panel rounded-3xl p-6"><p className="text-sm font-medium text-red-600">{message}</p></div>;
  }

  if (!items.length) {
    return <div className="lux-panel rounded-3xl p-6"><p className="text-sm text-slate-700">Non hai ancora ordini fotocopie registrati.</p></div>;
  }

  return (
    <div className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Storico ordini</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Fotocopie online</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {items.length} registrati
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-220 w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Pagine</th>
              <th className="px-4 py-3 font-semibold">Totale</th>
              <th className="px-4 py-3 font-semibold">Stato</th>
              <th className="px-4 py-3 font-semibold">PDF</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3 font-semibold text-slate-900">#{item.requestId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.customerName}</p>
                  <p className="text-xs text-slate-500">{item.email}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{item.pageCount}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatMoney(item.amountCents, item.currency)}</td>
                <td className="px-4 py-3">
                  <p>{item.requestStatus || item.paymentStatus || item.checkoutStatus || "n/d"}</p>
                  <p className="text-xs text-slate-500">{item.priceLabel || "Tariffa automatica"}</p>
                </td>
                <td className="px-4 py-3">
                  <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700 hover:underline">
                    {item.pdfFileName || "Apri PDF"}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
