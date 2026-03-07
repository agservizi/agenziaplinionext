"use client";

import { useState, type FormEvent } from "react";

type TicketItem = {
  id: number;
  requestId: number | null;
  customerName: string;
  email: string;
  phone: string;
  ticketArea: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  attachments: string[];
  messages?: Array<{
    id: number;
    ticketId: number;
    authorRole: string;
    authorName: string;
    message: string;
    attachments: string[];
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt?: string;
};

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  requestId: "",
  ticketArea: "visure",
  priority: "normale",
  subject: "",
  message: "",
};

function statusLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "aperto") return "Aperto";
  if (normalized === "in_lavorazione") return "In lavorazione";
  if (normalized === "chiuso") return "Chiuso";
  return value || "Aperto";
}

function authorLabel(value: string) {
  return value === "admin" ? "Backoffice" : "Cliente";
}

export default function TicketPraticheWorkspace() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [historyEmail, setHistoryEmail] = useState("");
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    setError("");

    try {
      const body = new FormData();
      body.set("customerName", form.customerName.trim());
      body.set("email", form.email.trim().toLowerCase());
      body.set("phone", form.phone.trim());
      body.set("requestId", form.requestId.trim());
      body.set("ticketArea", form.ticketArea);
      body.set("priority", form.priority);
      body.set("subject", form.subject.trim());
      body.set("message", form.message.trim());
      for (const file of files) {
        body.append("files", file);
      }

      const response = await fetch("/api/client-area/ticket", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as { message?: string; ticket?: TicketItem };
      if (!response.ok) {
        throw new Error(payload.message || "Ticket non creato.");
      }

      setFeedback(payload.message || "Ticket creato.");
      setForm(initialForm);
      setFiles([]);
      if (payload.ticket) {
        setTickets((current) => [payload.ticket!, ...current]);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ticket non creato.");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    setFeedback("");
    setError("");

    try {
      const response = await fetch("/api/client-area/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "list", email: historyEmail.trim().toLowerCase() }),
      });
      const payload = (await response.json()) as { message?: string; tickets?: TicketItem[] };
      if (!response.ok) {
        throw new Error(payload.message || "Storico ticket non disponibile.");
      }
      setTickets(Array.isArray(payload.tickets) ? payload.tickets : []);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Storico non disponibile.");
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-100/70 p-8 shadow-[0_20px_50px_rgba(8,47,73,0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Modulo Ticket Pratiche & Documenti
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">
          Apri un ticket operativo e allega i documenti in un solo passaggio
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Usa questo modulo per richieste su pratiche già pagate, integrazioni documentali,
          chiarimenti su stato lavorazione o consegna documenti finali.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
        >
          <h3 className="text-xl font-semibold text-slate-900">Apri nuovo ticket</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              placeholder="Nome e cognome"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              type="email"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
              required
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Telefono"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            />
            <input
              value={form.requestId}
              onChange={(event) => setForm((current) => ({ ...current, requestId: event.target.value }))}
              placeholder="ID pratica (opzionale)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            />
            <select
              value={form.ticketArea}
              onChange={(event) => setForm((current) => ({ ...current, ticketArea: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            >
              <option value="visure">Visure</option>
              <option value="spedizioni">Spedizioni</option>
              <option value="caf-patronato">CAF/Patronato</option>
              <option value="consulenza-utenze">Consulenza Utenze</option>
              <option value="generale">Generale</option>
            </select>
            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            >
              <option value="normale">Priorità normale</option>
              <option value="alta">Priorità alta</option>
              <option value="urgente">Priorità urgente</option>
            </select>
          </div>

          <input
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            placeholder="Oggetto ticket"
            className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            required
          />
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            rows={6}
            placeholder="Descrivi chiaramente la richiesta e cosa ti serve."
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            required
          />

          <label className="mt-4 block rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-4 text-sm text-slate-700">
            Allega documenti (opzionale)
            <input
              type="file"
              multiple
              className="mt-3 block w-full text-sm"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
          </label>
          {files.length > 0 ? (
            <p className="mt-2 text-xs text-slate-600">{files.length} allegato/i pronto/i</p>
          ) : null}

          {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
          {feedback ? <p className="mt-4 text-sm font-medium text-emerald-600">{feedback}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-full bg-cyan-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-70"
          >
            {saving ? "Sto aprendo il ticket..." : "Apri ticket"}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-semibold text-slate-900">Consulta ticket esistenti</h3>
          <p className="mt-2 text-sm text-slate-600">
            Inserisci la tua email per vedere lo storico pratiche aperte.
          </p>

          <div className="mt-4 flex gap-2">
            <input
              value={historyEmail}
              onChange={(event) => setHistoryEmail(event.target.value)}
              placeholder="email cliente"
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={loadHistory}
              disabled={loadingHistory}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {loadingHistory ? "..." : "Carica"}
            </button>
          </div>

          {tickets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nessun ticket da mostrare.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    #{ticket.id} · {ticket.subject}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {ticket.ticketArea} · {statusLabel(ticket.status)} · priorità {ticket.priority}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{ticket.message}</p>
                  {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ticket.attachments.map((url, index) => (
                        <a
                          key={`${ticket.id}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-cyan-700 underline"
                        >
                          Allegato {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  {Array.isArray(ticket.messages) && ticket.messages.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {ticket.messages.map((entry, idx) => (
                        <div
                          key={`${ticket.id}-${entry.id || idx}-${entry.createdAt}`}
                          className={`rounded-xl border px-3 py-2 text-xs ${
                            entry.authorRole === "admin"
                              ? "border-cyan-200 bg-cyan-50 text-slate-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <p className="font-semibold text-slate-800">
                            {authorLabel(entry.authorRole)} · {entry.authorName || "N/D"}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{entry.message}</p>
                          {entry.attachments.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-2">
                              {entry.attachments.map((url, index) => (
                                <a
                                  key={`${ticket.id}-${entry.id}-${index}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-semibold text-cyan-700 underline"
                                >
                                  Allegato {index + 1}
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
