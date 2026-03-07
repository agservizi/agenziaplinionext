"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminCafPatronatoRequests,
  getAdminPortalToken,
  updateAdminCafPatronatoStatus,
  type AdminCafPatronatoRecord,
} from "@/lib/admin-portal-auth";

function formatDate(value: string | null) {
  if (!value) return "Non disponibile";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(amountCents: number, currency: string) {
  if (!amountCents) return "Non disponibile";
  return `${(amountCents / 100).toFixed(2).replace(".", ",")} ${String(
    currency || "EUR",
  ).toUpperCase()}`;
}

export default function AdminCafPatronatoDashboard() {
  const [items, setItems] = useState<AdminCafPatronatoRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const token = getAdminPortalToken();

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const requests = await fetchAdminCafPatronatoRequests(token);
        if (!active) return;
        setItems(requests);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Non sto riuscendo a caricare le pratiche CAF e Patronato.",
        );
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    const awaiting = items.filter((item) => item.intakeStatus === "awaiting_review").length;
    const processing = items.filter((item) => item.intakeStatus === "processing").length;
    const completed = items.filter((item) => item.intakeStatus === "completed").length;

    return {
      total: items.length,
      awaiting,
      processing,
      completed,
    };
  }, [items]);

  const onStatusChange = async (item: AdminCafPatronatoRecord, nextStatus: string) => {
    setSavingId(item.requestId);
    setMessage("");

    try {
      await updateAdminCafPatronatoStatus(
        token,
        item.requestId,
        nextStatus,
        item.operatorNotes || "",
      );
      setItems((current) =>
        current.map((entry) =>
          entry.requestId === item.requestId
            ? { ...entry, intakeStatus: nextStatus, status: nextStatus }
            : entry,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Non riesco ad aggiornare questa pratica adesso.",
      );
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-medium text-slate-600">Sto recuperando le pratiche da gestire...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-medium text-red-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Totali</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.total}</p>
          <p className="mt-2 text-sm text-slate-600">Pratiche registrate</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Da vedere</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.awaiting}</p>
          <p className="mt-2 text-sm text-slate-600">Appena entrate</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">In corso</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.processing}</p>
          <p className="mt-2 text-sm text-slate-600">Sto lavorando qui</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Chiuse</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.completed}</p>
          <p className="mt-2 text-sm text-slate-600">Con documento già consegnato</p>
        </div>
      </section>

      {message ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5">
        {items.map((item) => (
          <article
            key={item.requestId}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  {item.serviceScope === "caf" ? "CAF" : "Patronato"} · pratica #{item.requestId}
                </p>
                <h2 className="text-2xl font-semibold text-slate-950">{item.serviceLabel}</h2>
                <p className="text-sm text-slate-600">
                  {item.customerName} · {item.email}
                </p>
                <p className="text-sm text-slate-500">{item.categoryLabel}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={item.intakeStatus}
                  onChange={(event) => void onStatusChange(item, event.target.value)}
                  disabled={savingId === item.requestId}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="awaiting_review">Da vedere</option>
                  <option value="processing">In lavorazione</option>
                  <option value="waiting-documents">In attesa documenti</option>
                  <option value="completed">Evasa</option>
                </select>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Mail: {item.operatorEmailStatus === "sent" ? "inviata" : "da verificare"}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Apertura
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.createdAt)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Magic link
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {item.magicLinkExpiresAt ? `Scade ${formatDate(item.magicLinkExpiresAt)}` : "Non inviato"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Allegati cliente
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.customerFiles.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Documento evaso
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.resolvedFiles.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Importo pratica
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatMoney(item.paymentAmountCents, item.paymentCurrency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.priceLabel || (item.paymentStatus ? `Pagamento ${item.paymentStatus}` : "Da allineare")}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Documenti cliente</p>
                {item.customerFiles.length ? (
                  <div className="mt-3 grid gap-2">
                    {item.customerFiles.map((file) => (
                      <a
                        key={`${item.requestId}-${file.downloadUrl}`}
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        {file.originalName}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Il cliente non ha allegato file iniziali.</p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Documento evaso</p>
                {item.resolvedFiles.length ? (
                  <div className="mt-3 grid gap-2">
                    {item.resolvedFiles.map((file) => (
                      <a
                        key={`${item.requestId}-${file.downloadUrl}`}
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-100"
                      >
                        {file.originalName}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Qui vedo il file evaso appena il patronato chiude la pratica dal link.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Note e priorità</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Priorità: {item.urgency || "non indicata"}.
                {item.documentSummary ? ` Documenti segnalati: ${item.documentSummary}.` : ""}
                {item.notes ? ` Nota cliente: ${item.notes}` : ""}
              </p>
              {item.operatorNotes ? (
                <p className="mt-3 text-sm leading-7 text-slate-700">Nota interna: {item.operatorNotes}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
