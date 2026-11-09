"use client";

/**
 * Fact-forcing: ticket file upload; add PrivateUploadNotice (DSA).
 * User: "procedi su tutto al 100% … chiudiamo questo GAP".
 */
import { useEffect, useState, type FormEvent } from "react";
import PrivateUploadNotice from "@/components/compliance/PrivateUploadNotice";

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

const inputCls =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";
const panelCls = "border border-[var(--ink)]/12 bg-[var(--paper)] p-5 md:p-6";
const primaryBtn =
  "brutal-cta-ink mt-5 inline-flex bg-[var(--ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#5E0ED7] disabled:opacity-70";

const initialForm = {
  customerName: "",
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
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    setFeedback("");
    setError("");

    try {
      const response = await fetch("/api/client-area/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "list" }),
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

  useEffect(() => {
    void loadHistory();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    setError("");

    try {
      const body = new FormData();
      body.set("customerName", form.customerName.trim());
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
      } else {
        await loadHistory();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ticket non creato.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className={panelCls}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Modulo operativo</p>
        <h2 className="mt-3 text-xl font-semibold text-[var(--ink)]">
          Apri un ticket e allega i documenti in un passaggio
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/60">
          Per pratiche già pagate, integrazioni documentali, chiarimenti su stato o consegna documenti finali.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className={panelCls}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">Apri nuovo ticket</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              placeholder="Nome e cognome"
              className={inputCls}
              required
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Telefono"
              className={inputCls}
            />
            <input
              value={form.requestId}
              onChange={(event) => setForm((current) => ({ ...current, requestId: event.target.value }))}
              placeholder="ID pratica (opzionale)"
              className={inputCls}
            />
            <select
              value={form.ticketArea}
              onChange={(event) => setForm((current) => ({ ...current, ticketArea: event.target.value }))}
              className={inputCls}
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
              className={inputCls}
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
            className={`mt-4 ${inputCls}`}
            required
          />
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            rows={6}
            placeholder="Descrivi chiaramente la richiesta e cosa ti serve."
            className={`mt-4 ${inputCls}`}
            required
          />

          <label className="mt-4 block border border-dashed border-[var(--ink)]/20 px-4 py-4 text-sm text-[var(--ink)]/70">
            Allega documenti (opzionale)
            <input
              type="file"
              multiple
              className="mt-3 block w-full text-sm"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
            <PrivateUploadNotice className="mt-3" />
          </label>
          {files.length > 0 ? (
            <p className="mt-2 text-xs text-slate-600">{files.length} allegato/i pronto/i</p>
          ) : null}

          {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
          {feedback ? <p className="mt-4 text-sm font-medium text-emerald-600">{feedback}</p> : null}

          <button type="submit" disabled={saving} className={primaryBtn}>
            {saving ? "Sto aprendo il ticket..." : "Apri ticket"}
          </button>
        </form>

        <div className={panelCls}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">I tuoi ticket</h3>
          <p className="mt-2 text-sm text-[var(--ink)]/55">
            Storico legato al tuo account. L&apos;email arriva dalla sessione, non da un campo libero.
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => void loadHistory()}
              disabled={loadingHistory}
              className="border border-[var(--ink)]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:border-[#5E0ED7] disabled:opacity-60"
            >
              {loadingHistory ? "..." : "Aggiorna"}
            </button>
          </div>

          {tickets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nessun ticket da mostrare.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-[var(--ink)]/12 p-4">
                  <p className="text-sm font-semibold text-[var(--ink)]">
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
                          className="text-xs font-semibold text-[#5E0ED7] underline"
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
