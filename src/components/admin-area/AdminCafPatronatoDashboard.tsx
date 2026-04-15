"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  fetchAdminCafPatronatoRequests,
  getAdminPortalToken,
  updateAdminCafPatronatoStatus,
  type AdminCafPatronatoRecord,
} from "@/lib/admin-portal-auth";
import { AdminEmptyState, AdminMetricCard, AdminStatusBadge } from "@/components/admin-area/AdminUi";

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
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<AdminCafPatronatoRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [operatorNotesDrafts, setOperatorNotesDrafts] = useState<Record<number, string>>({});

  const token = getAdminPortalToken();

  const handleSessionError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Sessione admin non valida. Esegui di nuovo il login.";
    if (message.toLowerCase().includes("sessione admin")) {
      router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`);
      return true;
    }
    return false;
  };

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
        if (handleSessionError(error)) return;
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const byStatus = statusFilter === "all" || item.intakeStatus === statusFilter;
      const byScope = scopeFilter === "all" || item.serviceScope === scopeFilter;
      const haystack = [
        item.customerName,
        item.email,
        item.phone,
        item.serviceLabel,
        item.categoryLabel,
        item.notes,
        item.documentSummary,
      ]
        .join(" ")
        .toLowerCase();
      const bySearch = searchTerm.trim() === "" || haystack.includes(searchTerm.trim().toLowerCase());
      return byStatus && byScope && bySearch;
    });
  }, [items, scopeFilter, searchTerm, statusFilter]);

  const onStatusChange = async (item: AdminCafPatronatoRecord, nextStatus: string) => {
    setSavingId(item.requestId);
    setMessage("");

    try {
      await updateAdminCafPatronatoStatus(
        token,
        item.requestId,
        nextStatus,
        operatorNotesDrafts[item.requestId] ?? item.operatorNotes ?? "",
      );
      setItems((current) =>
        current.map((entry) =>
          entry.requestId === item.requestId
            ? {
                ...entry,
                intakeStatus: nextStatus,
                status: nextStatus,
                operatorNotes: operatorNotesDrafts[item.requestId] ?? entry.operatorNotes,
              }
            : entry,
        ),
      );
    } catch (error) {
      if (handleSessionError(error)) return;
      setMessage(
        error instanceof Error ? error.message : "Non riesco ad aggiornare questa pratica adesso.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const onSaveOperatorNotes = async (item: AdminCafPatronatoRecord) => {
    setSavingId(item.requestId);
    setMessage("");

    try {
      const note = operatorNotesDrafts[item.requestId] ?? item.operatorNotes ?? "";
      await updateAdminCafPatronatoStatus(token, item.requestId, item.intakeStatus, note);
      setItems((current) =>
        current.map((entry) =>
          entry.requestId === item.requestId ? { ...entry, operatorNotes: note } : entry,
        ),
      );
      setMessage(`Note pratica #${item.requestId} salvate.`);
    } catch (error) {
      if (handleSessionError(error)) return;
      setMessage(
        error instanceof Error ? error.message : "Non riesco a salvare le note operatore adesso.",
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
        <AdminMetricCard eyebrow="Totali" value={stats.total} description="Pratiche registrate" />
        <AdminMetricCard eyebrow="Da vedere" value={stats.awaiting} description="Appena entrate" />
        <AdminMetricCard eyebrow="In corso" value={stats.processing} description="Pratiche in lavorazione" />
        <AdminMetricCard eyebrow="Chiuse" value={stats.completed} description="Con documento consegnato" />
      </section>

      {message ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {message}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <div className="grid gap-3 md:grid-cols-3">
        <label className="block md:col-span-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Cerca pratica
          </span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cliente, email, telefono, servizio, note..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Stato intake
          </span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
          >
            <option value="all">Tutti</option>
            <option value="awaiting_review">Da vedere</option>
            <option value="processing">In lavorazione</option>
            <option value="waiting-documents">In attesa documenti</option>
            <option value="completed">Evasa</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Ambito pratica
          </span>
          <select
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
          >
            <option value="all">Tutti</option>
            <option value="caf">CAF</option>
            <option value="patronato">Patronato</option>
          </select>
        </label>
        <div className="flex items-end">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {filteredItems.length} pratiche visibili
          </span>
        </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <AdminEmptyState
          title="Nessuna pratica trovata"
          description="Con i filtri correnti non risultano pratiche CAF o Patronato visibili. Prova a rimuovere uno dei filtri."
        />
      ) : null}

      <div className="grid gap-5">
        {filteredItems.map((item) => (
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
                <div className="flex flex-wrap gap-2">
                  {item.email ? (
                    <a
                      href={`mailto:${item.email}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      Email
                    </a>
                  ) : null}
                  {item.phone ? (
                    <a
                      href={`https://wa.me/${item.phone.replace(/\D+/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
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
                <AdminStatusBadge label="Mail" value={item.operatorEmailStatus === "sent" ? "sent" : "pending"} />
                <AdminStatusBadge label="Pratica" value={item.intakeStatus} />
              </div>
            </div>

            <div className="admin-adaptive-kpi-grid mt-6 grid gap-4 xl:grid-cols-5">
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

            <div className="admin-adaptive-top-grid mt-6 grid gap-4 xl:grid-cols-2">
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
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <textarea
                  value={operatorNotesDrafts[item.requestId] ?? item.operatorNotes ?? ""}
                  onChange={(event) =>
                    setOperatorNotesDrafts((current) => ({
                      ...current,
                      [item.requestId]: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Note operatore, passaggi fatti, documenti mancanti..."
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => void onSaveOperatorNotes(item)}
                  disabled={savingId === item.requestId}
                  className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingId === item.requestId ? "Salvataggio..." : "Salva note"}
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Timeline
                  </p>
                  <p className="mt-2 text-sm text-slate-700">Creata: {formatDate(item.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Mail operatore: {item.operatorEmailSentAt ? formatDate(item.operatorEmailSentAt) : "non inviata"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Risolta: {item.resolvedAt ? formatDate(item.resolvedAt) : "non ancora"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Contatto richiesto
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.preferredContactMethod || "non indicato"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {item.preferredContactDate ? formatDate(item.preferredContactDate) : "nessuna data"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Email operatore
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{item.operatorEmail || "non configurata"}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Stato: {item.operatorEmailStatus === "sent" ? "inviata" : "da verificare"}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
