"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminConsultingLeads,
  getAdminPortalToken,
  type AdminConsultingLead,
  updateAdminConsultingLeadStatus,
  uploadAdminConsultingQuote,
} from "@/lib/admin-portal-auth";
import { AdminEmptyState, AdminStatusBadge } from "@/components/admin-area/AdminUi";
import { AdminMetricCard } from "@/components/admin-area/AdminUi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const LEAD_STATUS_OPTIONS = ["nuova", "contattata", "qualificata", "offerta", "chiusa"];

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
      return "Offerta";
    case "chiusa":
      return "Chiusa";
    default:
      return value || "Nuova";
  }
}

export default function AdminConsultingLeadsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState<AdminConsultingLead[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [quoteNotes, setQuoteNotes] = useState<Record<number, string>>({});
  const [operatorNotesDrafts, setOperatorNotesDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminConsultingLeads(token);
        if (!active) return;
        setLeads(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento lead consulenze");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const byStatus = statusFilter === "all" || lead.leadStatus === statusFilter;
        const byService = serviceFilter === "all" || lead.serviceType === serviceFilter;
        const haystack = [
          lead.customerName,
          lead.email,
          lead.phone,
          lead.businessName,
          lead.currentProvider,
          lead.city,
        ]
          .join(" ")
          .toLowerCase();
        const bySearch = searchTerm.trim() === "" || haystack.includes(searchTerm.trim().toLowerCase());
        return byStatus && byService && bySearch;
      }),
    [leads, searchTerm, serviceFilter, statusFilter],
  );

  const metrics = useMemo(() => {
    return {
      total: leads.length,
      nuove: leads.filter((lead) => lead.leadStatus === "nuova").length,
      offerte: leads.filter((lead) => lead.leadStatus === "offerta").length,
      chiuse: leads.filter((lead) => lead.leadStatus === "chiusa").length,
    };
  }, [leads]);

  const onLeadStatusChange = async (requestId: number, nextStatus: string) => {
    setSavingId(requestId);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const note = operatorNotesDrafts[requestId] ?? leads.find((item) => item.requestId === requestId)?.operatorNotes ?? "";
      await updateAdminConsultingLeadStatus(token, requestId, nextStatus, note);
      setLeads((current) =>
        current.map((lead) =>
          lead.requestId === requestId
            ? { ...lead, leadStatus: nextStatus, operatorNotes: note }
            : lead,
        ),
      );
      setMessage(`Lead #${requestId} aggiornata a ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore aggiornamento lead");
    } finally {
      setSavingId(null);
    }
  };

  const onUploadQuote = async (requestId: number, file: File | null) => {
    if (!file) return;

    setUploadingId(requestId);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const note = quoteNotes[requestId] || "";
      const result = await uploadAdminConsultingQuote(token, requestId, file, note);

      setLeads((current) =>
        current.map((lead) =>
          lead.requestId === requestId
            ? {
                ...lead,
                leadStatus: "offerta",
                quote: result.quote,
              }
            : lead,
        ),
      );
      setMessage(result.message || `Preventivo inviato per lead #${requestId}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore invio preventivo");
    } finally {
      setUploadingId(null);
    }
  };

  const onSaveOperatorNotes = async (requestId: number) => {
    const lead = leads.find((item) => item.requestId === requestId);
    if (!lead) return;

    setSavingId(requestId);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const note = operatorNotesDrafts[requestId] ?? lead.operatorNotes ?? "";
      await updateAdminConsultingLeadStatus(token, requestId, lead.leadStatus, note);
      setLeads((current) =>
        current.map((item) =>
          item.requestId === requestId ? { ...item, operatorNotes: note } : item,
        ),
      );
      setMessage(`Note operatore salvate per lead #${requestId}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore salvataggio note operatore");
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando le lead consulenze...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-600">{message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Lead Consulenze
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Lead visibili: <strong className="text-slate-950">{filteredLeads.length}</strong> su{" "}
          <strong className="text-slate-950">{leads.length}</strong> totali.
        </p>
        {message ? <p className="mt-3 text-sm font-medium text-cyan-700">{message}</p> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <AdminMetricCard eyebrow="Totali" value={metrics.total} />
          <AdminMetricCard eyebrow="Nuove" value={metrics.nuove} />
          <AdminMetricCard eyebrow="Offerte" value={metrics.offerte} />
          <AdminMetricCard eyebrow="Chiuse" value={metrics.chiuse} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Cerca
            </span>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cliente, email, telefono, azienda, fornitore..."
              className="rounded-full"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro servizio
            </span>
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none"
            >
              <option value="all">Tutti i servizi</option>
              <option value="telefonia">Telefonia</option>
              <option value="luce">Luce</option>
              <option value="gas">Gas</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro stato lead
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none"
            >
              <option value="all">Tutti gli stati</option>
              {LEAD_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </label>
        </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <AdminEmptyState
            title="Nessun lead trovato"
            description="Con i filtri attuali non risultano lead consulenze visibili. Prova a cambiare servizio, stato o ricerca."
          />
        ) : null}

        {filteredLeads.map((lead) => (
          <div key={lead.requestId} className="glass-card rounded-4xl p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  #{lead.requestId} • {formatService(lead.serviceType)}
                </p>
                <h2 className="text-xl font-semibold text-white">{lead.customerName}</h2>
                <p className="text-sm text-slate-300">
                  {lead.email}
                  {lead.phone ? ` • ${lead.phone}` : ""}
                  {lead.city ? ` • ${lead.city}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      Email
                    </a>
                  ) : null}
                  {lead.phone ? (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D+/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
                <p className="text-sm text-slate-400">Creata: {formatDate(lead.createdAt)}</p>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <select
                  value={lead.leadStatus}
                  onChange={(event) => onLeadStatusChange(lead.requestId, event.target.value)}
                  disabled={savingId === lead.requestId}
                  className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                >
                  {LEAD_STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <AdminStatusBadge value={lead.leadStatus} className="border-white/10 bg-white/5 text-slate-100" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Fornitore attuale
                </p>
                <p className="mt-2 text-sm text-slate-200">{lead.currentProvider || "Non indicato"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Spesa media
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {lead.monthlySpendEUR > 0 ? `${lead.monthlySpendEUR.toFixed(2)} €` : "Non indicata"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Marketing
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {lead.marketingConsent ? "Consenso" : "No consenso"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Stato richiesta
                </p>
                <p className="mt-2 text-sm text-slate-200">{lead.requestStatus || "n/d"}</p>
                <p className="mt-1 text-xs text-slate-400">Aggiornata: {formatDate(lead.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Nota operatore
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <textarea
                  value={operatorNotesDrafts[lead.requestId] ?? lead.operatorNotes ?? ""}
                  onChange={(event) =>
                    setOperatorNotesDrafts((current) => ({
                      ...current,
                      [lead.requestId]: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Esito chiamata, prossimi passi, offerta consigliata..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => void onSaveOperatorNotes(lead.requestId)}
                  disabled={savingId === lead.requestId}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                >
                  {savingId === lead.requestId ? "Salvataggio..." : "Salva note"}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Invio preventivo al cliente
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={quoteNotes[lead.requestId] ?? lead.quote?.note ?? ""}
                  onChange={(event) =>
                    setQuoteNotes((current) => ({ ...current, [lead.requestId]: event.target.value }))
                  }
                  placeholder="Nota interna o messaggio breve per il preventivo"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                />
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500">
                  {uploadingId === lead.requestId ? "Invio..." : "Allega preventivo"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(event) => {
                      void onUploadQuote(lead.requestId, event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              {lead.quote?.url ? (
                <p className="mt-3 text-sm text-cyan-200">
                  Preventivo inviato: <a className="underline" href={lead.quote.url} target="_blank" rel="noreferrer">{lead.quote.fileName || "Apri file"}</a>
                  {lead.quote.sentAt ? ` • ${formatDate(lead.quote.sentAt)}` : ""}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Nessun preventivo allegato al momento.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
