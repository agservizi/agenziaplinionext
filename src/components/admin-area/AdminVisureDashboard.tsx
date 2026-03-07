"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminClientAreaVisure,
  getAdminPortalToken,
  type AdminVisuraRecord,
} from "@/lib/admin-portal-auth";

export default function AdminVisureDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [visure, setVisure] = useState<AdminVisuraRecord[]>([]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminClientAreaVisure(token);
        if (!active) return;
        setVisure(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento visure");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando le visure...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-600">{message}</p>;
  }

  const pendingProvider = visure.filter(
    (item) => item.providerStatus !== "completed" && item.providerStatus !== "evasa",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Totali
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{visure.length}</p>
          <p className="mt-2 text-sm text-slate-600">Richieste visure registrate</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            In lavorazione
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{pendingProvider}</p>
          <p className="mt-2 text-sm text-slate-600">Provider ancora non conclusi</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Documenti pronti
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {visure.filter((item) => Boolean(item.documentUrl)).length}
          </p>
          <p className="mt-2 text-sm text-slate-600">Con link documento disponibile</p>
        </div>
      </div>

      <div className="space-y-4">
        {visure.map((item) => (
          <div
            key={item.id}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Visura #{item.id}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {item.providerService || item.serviceType}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {item.customerName} • {item.email}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Creata: {new Date(item.createdAt).toLocaleString("it-IT")}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Stato pratica
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.status}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Stato provider
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.providerStatus || "processing"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Provider
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.provider || "n/d"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Rif. OpenAPI
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {item.providerRequestId || "n/d"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Documento
                </p>
                {item.documentUrl ? (
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-semibold text-cyan-700"
                  >
                    Apri documento
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-900">Non pronto</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Importo
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {item.paymentAmountCents
                    ? `${(item.paymentAmountCents / 100).toFixed(2).replace(".", ",")} ${String(
                        item.paymentCurrency || "eur",
                      ).toUpperCase()}`
                    : "n/d"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.priceLabel || item.paymentStatus || "Pagamento registrato"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Aggiornata
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {new Date(item.updatedAt).toLocaleString("it-IT")}
                </p>
              </div>
            </div>

            {item.summary && Object.keys(item.summary).length > 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Riepilogo provider
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {Object.entries(item.summary).map(([key, value]) => (
                    <div key={key} className="text-sm text-slate-600">
                      <strong className="text-slate-900">{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
