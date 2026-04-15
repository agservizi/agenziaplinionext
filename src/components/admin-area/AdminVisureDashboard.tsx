"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  fetchAdminClientAreaVisure,
  getAdminPortalToken,
  uploadAdminClientAreaVisuraDocument,
  type AdminVisuraRecord,
} from "@/lib/admin-portal-auth";
import { AdminEmptyState, AdminMetricCard, AdminStatusBadge } from "@/components/admin-area/AdminUi";

function formatDate(value?: string) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ActionIcon({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <span className="group relative inline-flex">
      <span
        aria-label={title}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-slate-700 transition ${className || "border-slate-200 bg-white hover:bg-slate-50"}`}
      >
        {children}
      </span>
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {title}
      </span>
    </span>
  );
}

export default function AdminVisureDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [visure, setVisure] = useState<AdminVisuraRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerStatusFilter, setProviderStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [rowMessage, setRowMessage] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});

  const loadVisure = async () => {
    const token = getAdminPortalToken();
    const payload = await fetchAdminClientAreaVisure(token);
    setVisure(payload);
  };

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

  const handleUpload = async (item: AdminVisuraRecord) => {
    const file = selectedFiles[item.id];
    if (!file) {
      setRowMessage(`Seleziona un file per la pratica #${item.id}.`);
      return;
    }

    try {
      setUploadingId(item.id);
      setRowMessage("");
      const token = getAdminPortalToken();
      const result = await uploadAdminClientAreaVisuraDocument(token, item.id, file);
      await loadVisure();
      setSelectedFiles((current) => ({ ...current, [item.id]: null }));
      setRowMessage(result.message);
    } catch (error) {
      setRowMessage(error instanceof Error ? error.message : "Errore caricamento visura");
    } finally {
      setUploadingId(null);
    }
  };

  const filteredVisure = useMemo(() => {
    return visure.filter((item) => {
      const haystack = [
        item.customerName,
        item.email,
        item.phone,
        item.clientUsername,
        item.clientCompanyName,
        item.serviceType,
        item.providerService,
        item.providerRequestId,
      ]
        .join(" ")
        .toLowerCase();
      const bySearch =
        searchQuery.trim() === "" || haystack.includes(searchQuery.trim().toLowerCase());
      const byProviderStatus =
        providerStatusFilter === "all" || (item.providerStatus || "processing") === providerStatusFilter;
      const byRequestStatus = requestStatusFilter === "all" || item.status === requestStatusFilter;
      const byDocument =
        documentFilter === "all" ||
        (documentFilter === "ready" && Boolean(item.documentUrl)) ||
        (documentFilter === "missing" && !item.documentUrl);
      return bySearch && byProviderStatus && byRequestStatus && byDocument;
    });
  }, [documentFilter, providerStatusFilter, requestStatusFilter, searchQuery, visure]);

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
        <AdminMetricCard eyebrow="Totali" value={visure.length} description="Richieste visure registrate" />
        <AdminMetricCard eyebrow="In lavorazione" value={pendingProvider} description="Provider ancora non conclusi" />
        <AdminMetricCard eyebrow="Documenti pronti" value={visure.filter((item) => Boolean(item.documentUrl)).length} description="Con link documento disponibile" />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block md:col-span-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Cerca pratica
            </span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome, email, telefono, username, azienda, servizio, riferimento..."
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Stato richiesta
            </span>
            <select
              value={requestStatusFilter}
              onChange={(event) => setRequestStatusFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="all">Tutti</option>
              <option value="new">Nuova</option>
              <option value="processing">In lavorazione</option>
              <option value="completed">Completata</option>
              <option value="cancelled">Annullata</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Stato provider
            </span>
            <select
              value={providerStatusFilter}
              onChange={(event) => setProviderStatusFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="all">Tutti</option>
              <option value="processing">In lavorazione</option>
              <option value="awaiting_manual_fulfillment">Presa in carico</option>
              <option value="waiting-documents">In attesa documenti</option>
              <option value="completed">Evasa</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Documento
            </span>
            <select
              value={documentFilter}
              onChange={(event) => setDocumentFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="all">Tutte</option>
              <option value="ready">Documento pronto</option>
              <option value="missing">Documento non pronto</option>
            </select>
          </label>
          <div className="flex items-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {filteredVisure.length} visure visibili
            </span>
          </div>
        </div>
      </div>

      {filteredVisure.length === 0 ? (
        <AdminEmptyState
          title="Nessuna visura trovata"
          description="Con i filtri attuali non risultano pratiche visure visibili. Prova a rimuovere filtri o ampliare la ricerca."
        />
      ) : null}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        {rowMessage ? (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{rowMessage}</div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Pratica</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Cliente</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Stato</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Provider</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Documento</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Importo</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Aggiornata</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.16em] text-slate-500">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisure.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 align-top last:border-b-0">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">#{item.id}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.providerService || item.serviceType}</p>
                    <p className="mt-1 text-xs text-slate-500">Creata {formatDate(item.createdAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{item.customerName}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.email}</p>
                    {item.phone ? <p className="mt-1 text-sm text-slate-500">{item.phone}</p> : null}
                    <p className="mt-2 text-xs text-slate-500">
                      {item.clientUsername ? `Accesso: ${item.clientUsername}` : "Accesso non tracciato"}
                      {item.clientCompanyName ? ` • ${item.clientCompanyName}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <AdminStatusBadge value={item.status} />
                      <AdminStatusBadge value={item.providerStatus || "processing"} />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{item.provider || "n/d"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.providerService || item.serviceType || "Servizio non disponibile"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {item.documentUrl ? (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                      >
                        Apri documento
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500">Non pronto</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">
                      {item.paymentAmountCents
                        ? `${(item.paymentAmountCents / 100).toFixed(2).replace(".", ",")} ${String(
                            item.paymentCurrency || "eur",
                          ).toUpperCase()}`
                        : "n/d"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.priceLabel || item.paymentStatus || "Pagamento registrato"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-700">{formatDate(item.updatedAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {!item.documentUrl ? (
                        <>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                setSelectedFiles((current) => ({ ...current, [item.id]: file }));
                              }}
                            />
                            <ActionIcon
                              title={
                                selectedFiles[item.id]?.name
                                  ? `File selezionato: ${selectedFiles[item.id]?.name}`
                                  : "Seleziona visura"
                              }
                            >
                              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                                <path d="M12 16V7m0 0l-3 3m3-3l3 3M6 17.5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </ActionIcon>
                          </label>
                          <button
                            type="button"
                            onClick={() => void handleUpload(item)}
                            disabled={uploadingId === item.id}
                            title={uploadingId === item.id ? "Caricamento in corso" : "Carica visura"}
                            aria-label={uploadingId === item.id ? "Caricamento in corso" : "Carica visura"}
                            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {uploadingId === item.id ? (
                              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 animate-spin" fill="none" aria-hidden="true">
                                <path d="M12 4a8 8 0 018 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                                <path d="M7 12.5l3.2 3.2L17 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
                              {uploadingId === item.id ? "Caricamento in corso" : "Carica visura"}
                            </span>
                          </button>
                        </>
                      ) : null}
                      {item.email ? (
                        <a
                          href={`mailto:${item.email}`}
                          title="Invia email"
                          aria-label="Invia email"
                          className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                            <path d="M4 7.5h16v9H4zm0 0l8 5 8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
                            Invia email
                          </span>
                        </a>
                      ) : null}
                      {item.phone ? (
                        <a
                          href={`https://wa.me/${item.phone.replace(/\D+/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Apri WhatsApp"
                          aria-label="Apri WhatsApp"
                          className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                            <path d="M12 20a8 8 0 10-4.2-1.2L5 20l1.3-2.6A8 8 0 0012 20z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9.7 10.2c.3-.3.7-.3 1 0l.3.3c.2.2.2.5 0 .8l-.2.3c-.1.2-.1.4 0 .6.3.5.8 1 1.3 1.3.2.1.4.1.6 0l.3-.2c.2-.2.6-.2.8 0l.3.3c.3.3.3.7 0 1-.3.4-.9.6-1.4.4-1.3-.4-2.6-1.5-3.5-3.1-.3-.5-.1-1.1.5-1.7z" fill="currentColor" stroke="none" />
                          </svg>
                          <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
                            Apri WhatsApp
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
