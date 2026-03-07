"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createAdminClientAreaTicket,
  fetchAdminClientAreaTickets,
  getAdminPortalToken,
  replyAdminClientAreaTicket,
  updateAdminClientAreaTicketStatus,
  type AdminTicketRecord,
} from "@/lib/admin-portal-auth";

const STATUS_OPTIONS = ["aperto", "in_lavorazione", "in_attesa_cliente", "chiuso"];

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("it-IT");
  } catch {
    return value;
  }
}

export default function AdminTicketsDashboard() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<AdminTicketRecord[]>([]);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<number | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("in_attesa_cliente");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [createForm, setCreateForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    requestId: "",
    ticketArea: "generale",
    priority: "normale",
    subject: "",
    message: "",
  });

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getAdminPortalToken();
      const records = await fetchAdminClientAreaTickets(token, {
        area: areaFilter,
        status: statusFilter,
        search,
      });
      setTickets(records);
      if (records.length > 0 && !records.some((entry) => entry.id === activeId)) {
        setActiveId(records[0].id);
      }
      if (records.length === 0) {
        setActiveId(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Caricamento ticket non riuscito");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTicket = useMemo(
    () => tickets.find((entry) => entry.id === activeId) || null,
    [activeId, tickets],
  );

  const onUpdateStatus = async (ticketId: number, status: string) => {
    setSavingStatusId(ticketId);
    setFeedback("");
    setError("");
    try {
      const token = getAdminPortalToken();
      await updateAdminClientAreaTicketStatus(token, ticketId, status);
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status, updatedAt: new Date().toISOString() }
            : ticket,
        ),
      );
      setFeedback(`Ticket #${ticketId} aggiornato a "${status}".`);
    } catch (statusError) {
      setError(
        statusError instanceof Error ? statusError.message : "Aggiornamento stato non riuscito",
      );
    } finally {
      setSavingStatusId(null);
    }
  };

  const onSendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setSendingReply(true);
    setFeedback("");
    setError("");
    try {
      const token = getAdminPortalToken();
      const result = await replyAdminClientAreaTicket(token, {
        ticketId: activeTicket.id,
        message: replyText.trim(),
        status: replyStatus,
        files: replyFiles,
      });

      const createdAt = result.reply?.createdAt || new Date().toISOString();
      setTickets((current) =>
        current.map((ticket) => {
          if (ticket.id !== activeTicket.id) return ticket;
          return {
            ...ticket,
            status: replyStatus,
            updatedAt: createdAt,
            messages: [
              ...ticket.messages,
              {
                id: Number(result.reply?.id || 0),
                ticketId: ticket.id,
                authorRole: "admin",
                authorName: String(result.reply?.authorName || "Backoffice"),
                message: replyText.trim(),
                attachments: Array.isArray(result.reply?.attachments)
                  ? result.reply!.attachments
                  : [],
                createdAt,
              },
            ],
          };
        }),
      );
      setFeedback(result.message);
      setReplyText("");
      setReplyFiles([]);
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : "Invio risposta non riuscito");
    } finally {
      setSendingReply(false);
    }
  };

  const onCreateTicket = async (event: FormEvent) => {
    event.preventDefault();
    if (!createForm.customerName.trim() || !createForm.email.trim() || !createForm.subject.trim()) {
      setError("Compila almeno nome cliente, email e oggetto ticket.");
      return;
    }

    setCreatingTicket(true);
    setFeedback("");
    setError("");
    try {
      const token = getAdminPortalToken();
      const requestIdValue = Number(createForm.requestId || 0);
      const requestId =
        Number.isFinite(requestIdValue) && requestIdValue > 0 ? requestIdValue : null;
      const result = await createAdminClientAreaTicket(token, {
        customerName: createForm.customerName.trim(),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.trim(),
        requestId,
        ticketArea: createForm.ticketArea,
        priority: createForm.priority,
        subject: createForm.subject.trim(),
        message: createForm.message.trim(),
        files: createFiles,
      });

      if (result.ticket) {
        setTickets((current) => [result.ticket!, ...current]);
        setActiveId(result.ticket.id);
      }
      setFeedback(result.message);
      setCreateForm({
        customerName: "",
        email: "",
        phone: "",
        requestId: "",
        ticketArea: "generale",
        priority: "normale",
        subject: "",
        message: "",
      });
      setCreateFiles([]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Apertura ticket non riuscita");
    } finally {
      setCreatingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onCreateTicket} className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Apri ticket per conto cliente
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Creo un nuovo ticket direttamente da admin quando il cliente contatta via telefono/email.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={createForm.customerName}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, customerName: event.target.value }))
            }
            placeholder="Nome cliente"
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
            required
          />
          <input
            value={createForm.email}
            onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email cliente"
            type="email"
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
            required
          />
          <input
            value={createForm.phone}
            onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Telefono"
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          />
          <input
            value={createForm.requestId}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, requestId: event.target.value }))
            }
            placeholder="ID pratica (opzionale)"
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          />
          <select
            value={createForm.ticketArea}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, ticketArea: event.target.value }))
            }
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          >
            <option value="visure">Visure</option>
            <option value="spedizioni">Spedizioni</option>
            <option value="caf-patronato">CAF/Patronato</option>
            <option value="consulenza-utenze">Consulenza Utenze</option>
            <option value="generale">Generale</option>
          </select>
          <select
            value={createForm.priority}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, priority: event.target.value }))
            }
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          >
            <option value="normale">Priorità normale</option>
            <option value="alta">Priorità alta</option>
            <option value="urgente">Priorità urgente</option>
          </select>
          <input
            value={createForm.subject}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, subject: event.target.value }))
            }
            placeholder="Oggetto ticket"
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none md:col-span-2"
            required
          />
          <input
            type="file"
            multiple
            onChange={(event) => setCreateFiles(Array.from(event.target.files || []))}
            className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 xl:col-span-2"
          />
        </div>
        <textarea
          value={createForm.message}
          onChange={(event) => setCreateForm((current) => ({ ...current, message: event.target.value }))}
          rows={3}
          placeholder="Dettaglio richiesta cliente..."
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
          required
        />
        <button
          type="submit"
          disabled={creatingTicket}
          className="mt-3 rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-70"
        >
          {creatingTicket ? "Apertura ticket..." : "Apri ticket da admin"}
        </button>
      </form>

      <div className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Ticket Pratiche & Documenti
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Qui gestisco i ticket clienti, cambio stato e invio contro-risposte operative.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <select
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          >
            <option value="all">Tutte le aree</option>
            <option value="visure">Visure</option>
            <option value="spedizioni">Spedizioni</option>
            <option value="caf-patronato">CAF/Patronato</option>
            <option value="consulenza-utenze">Consulenza Utenze</option>
            <option value="generale">Generale</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          >
            <option value="all">Tutti gli stati</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cerca nome, email o oggetto"
            className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
          />
          <button
            type="button"
            onClick={() => void loadTickets()}
            className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Aggiorna elenco
          </button>
        </div>
        {feedback ? <p className="mt-4 text-sm text-emerald-300">{feedback}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-4xl p-4">
          {loading ? (
            <p className="p-4 text-sm text-slate-300">Sto caricando i ticket...</p>
          ) : tickets.length === 0 ? (
            <p className="p-4 text-sm text-slate-300">Nessun ticket trovato con i filtri attuali.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const active = activeId === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveId(ticket.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-white/10 bg-slate-950/50 hover:border-cyan-300/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      #{ticket.id} • {ticket.subject}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {ticket.customerName} • {ticket.ticketArea} • {ticket.status}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">{ticket.message}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card rounded-4xl p-6">
          {!activeTicket ? (
            <p className="text-sm text-slate-300">Seleziona un ticket per vedere il dettaglio.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Ticket #{activeTicket.id}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activeTicket.subject}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {activeTicket.customerName} • {activeTicket.email}
                    {activeTicket.phone ? ` • ${activeTicket.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Creato {formatDateTime(activeTicket.createdAt)} • aggiornato{" "}
                    {formatDateTime(activeTicket.updatedAt)}
                  </p>
                </div>
                <select
                  value={activeTicket.status}
                  onChange={(event) => void onUpdateStatus(activeTicket.id, event.target.value)}
                  disabled={savingStatusId === activeTicket.id}
                  className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Conversazione
                </p>
                <div className="mt-4 space-y-3">
                  {activeTicket.messages.map((entry, index) => (
                    <div
                      key={`${entry.ticketId}-${entry.id || index}-${entry.createdAt}`}
                      className={`rounded-2xl border p-3 ${
                        entry.authorRole === "admin"
                          ? "border-cyan-500/30 bg-cyan-500/10"
                          : "border-white/10 bg-slate-900/60"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                        {entry.authorRole === "admin" ? "Backoffice" : "Cliente"} •{" "}
                        {entry.authorName || "N/D"}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-white">{entry.message}</p>
                      {entry.attachments.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {entry.attachments.map((url, fileIndex) => (
                            <a
                              key={`${entry.ticketId}-${entry.id}-${fileIndex}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-cyan-200 underline"
                            >
                              Allegato {fileIndex + 1}
                            </a>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-2 text-[11px] text-slate-400">{formatDateTime(entry.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={onSendReply} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Invia contro-risposta
                </p>
                <textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  rows={4}
                  placeholder="Scrivi aggiornamento operativo per il cliente..."
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
                  required
                />
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="file"
                    multiple
                    onChange={(event) => setReplyFiles(Array.from(event.target.files || []))}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
                  />
                  <select
                    value={replyStatus}
                    onChange={(event) => setReplyStatus(event.target.value)}
                    className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="mt-4 rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-70"
                >
                  {sendingReply ? "Invio in corso..." : "Invia risposta al cliente"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
