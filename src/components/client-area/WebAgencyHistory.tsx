"use client";

import { useEffect, useState } from "react";
import { getClientPortalToken } from "@/lib/client-portal-auth";

type ProjectHistoryItem = {
  requestId: number;
  projectType: string;
  customerName: string;
  email: string;
  phone: string;
  requestStatus: string;
  projectGoal: string;
  budgetRange: string;
  timeline: string;
  businessSector: string;
  existingSiteUrl: string;
  contactPreference: string;
  materialsReady: string;
  hasExistingSite: boolean;
  needsBranding: boolean;
  needsSeo: boolean;
  quoteAvailable: boolean;
  projectStatus: string;
  createdAt: string | null;
  quote?: {
    fileName?: string;
    url?: string;
    sentAt?: string;
    note?: string;
  };
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

function formatProjectType(value: string) {
  switch (value) {
    case "sito-vetrina":
      return "Sito vetrina";
    case "ecommerce":
      return "E-commerce";
    case "seo-local":
      return "SEO locale";
    case "gestionale":
      return "Gestionale";
    case "landing-page":
    case "advertising":
      return "Landing page";
    default:
      return value || "n/d";
  }
}

function formatProjectStatus(value: string) {
  switch (value) {
    case "nuova":
      return "Nuova";
    case "brief_ricevuto":
      return "Brief ricevuto";
    case "qualificata":
      return "Qualificata";
    case "offerta":
      return "Offerta inviata";
    case "in_lavorazione":
      return "In lavorazione";
    case "chiusa":
      return "Chiusa";
    default:
      return value || "Nuova";
  }
}

export default function WebAgencyHistory() {
  const [items, setItems] = useState<ProjectHistoryItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/client-area/web-agency/history", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: getClientPortalToken(),
          }),
        });
        const payload = (await response.json()) as { projects?: ProjectHistoryItem[]; message?: string };

        if (!response.ok) {
          throw new Error(payload.message || "Impossibile caricare lo storico progetti.");
        }

        if (!active) return;
        setItems(payload.projects || []);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Impossibile caricare lo storico progetti.");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="lux-panel rounded-3xl p-6"><p className="text-sm font-medium text-slate-600">Sto recuperando i brief...</p></div>;
  }

  if (status === "error") {
    return <div className="lux-panel rounded-3xl p-6"><p className="text-sm font-medium text-red-600">{message}</p></div>;
  }

  if (!items.length) {
    return (
      <div className="lux-panel rounded-3xl p-6">
        <p className="text-sm font-medium text-slate-700">
          Nessun brief registrato. Invia la prima richiesta Web Agency per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Storico brief</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Web Agency</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {items.length} richieste
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-300 w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Progetto</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Obiettivo</th>
              <th className="px-4 py-3 font-semibold">Budget</th>
              <th className="px-4 py-3 font-semibold">Stato</th>
              <th className="px-4 py-3 font-semibold">Brief</th>
              <th className="px-4 py-3 font-semibold">Proposta</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.requestId} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3 font-semibold text-slate-900">#{item.requestId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{formatProjectType(item.projectType)}</p>
                  <p className="text-xs text-slate-500">{item.businessSector || "Settore non indicato"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.customerName || "n/d"}</p>
                  <p className="text-xs text-slate-500">{item.email || ""}</p>
                  <p className="text-xs text-slate-500">{item.phone || ""}</p>
                </td>
                <td className="px-4 py-3">{item.projectGoal || "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p>{item.budgetRange || "-"}</p>
                  <p className="text-xs text-slate-500">{item.timeline || "-"}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatProjectStatus(item.projectStatus)}</td>
                <td className="px-4 py-3 max-w-80">
                  <p className="text-xs text-slate-600">
                    {item.hasExistingSite ? "Sito esistente" : "Nuovo progetto"}
                    {item.existingSiteUrl ? ` · ${item.existingSiteUrl}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Contatto: {item.contactPreference || "indifferente"}
                    {item.materialsReady ? ` · Materiali: ${item.materialsReady}` : ""}
                  </p>
                  {(item.needsBranding || item.needsSeo) ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Extra:
                      {item.needsBranding ? " branding" : ""}
                      {item.needsSeo ? `${item.needsBranding ? "," : ""} SEO` : ""}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {item.quote?.url ? (
                    <div className="space-y-1">
                      <a className="font-medium text-cyan-700 underline" href={item.quote.url} target="_blank" rel="noreferrer">
                        {item.quote.fileName || "Apri proposta"}
                      </a>
                      {item.quote.sentAt ? (
                        <p className="text-xs text-slate-500">Caricata il {formatDate(item.quote.sentAt)}</p>
                      ) : null}
                      {item.quote.note ? <p className="text-xs text-slate-500">{item.quote.note}</p> : null}
                    </div>
                  ) : (
                    <span className="text-slate-500">In preparazione</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
