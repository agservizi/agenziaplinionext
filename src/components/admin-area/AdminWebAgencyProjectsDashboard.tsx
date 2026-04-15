"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminEmptyState, AdminMetricCard } from "@/components/admin-area/AdminUi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchAdminWebAgencyProjects,
  getAdminPortalToken,
  type AdminWebAgencyProject,
  updateAdminWebAgencyProjectStatus,
  uploadAdminWebAgencyQuote,
} from "@/lib/admin-portal-auth";

const PROJECT_STATUS_OPTIONS = ["nuova", "brief_ricevuto", "qualificata", "offerta", "in_lavorazione", "chiusa"];

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
      return "Offerta";
    case "in_lavorazione":
      return "In lavorazione";
    case "chiusa":
      return "Chiusa";
    default:
      return value || "Nuova";
  }
}

function projectStatusClassName(value: string) {
  switch (value) {
    case "nuova":
      return "border-sky-400/30 bg-sky-500/15 text-sky-200";
    case "brief_ricevuto":
      return "border-indigo-400/30 bg-indigo-500/15 text-indigo-200";
    case "qualificata":
      return "border-amber-400/30 bg-amber-500/15 text-amber-200";
    case "offerta":
      return "border-cyan-400/30 bg-cyan-500/15 text-cyan-200";
    case "in_lavorazione":
      return "border-violet-400/30 bg-violet-500/15 text-violet-200";
    case "chiusa":
      return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
    default:
      return "border-slate-400/20 bg-slate-500/10 text-slate-200";
  }
}

function projectTypeClassName(value: string) {
  switch (value) {
    case "sito-vetrina":
      return "border-cyan-400/30 bg-cyan-500/10 text-cyan-200";
    case "ecommerce":
      return "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200";
    case "seo-local":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
    case "gestionale":
      return "border-orange-400/30 bg-orange-500/10 text-orange-200";
    case "landing-page":
    case "advertising":
      return "border-rose-400/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-slate-400/20 bg-slate-500/10 text-slate-200";
  }
}

function getProjectLabels(projectType: string) {
  switch (projectType) {
    case "ecommerce":
      return {
        goalLabel: "Obiettivo e-commerce",
        budgetLabel: "Budget / go-live",
        materialsLabel: "Catalogo / materiali",
        extrasLabel: "Asset e canali",
      };
    case "seo-local":
      return {
        goalLabel: "Obiettivo SEO locale",
        budgetLabel: "Budget / priorità",
        materialsLabel: "Presenza attuale",
        extrasLabel: "Canali attivi",
      };
    case "gestionale":
      return {
        goalLabel: "Esigenza gestionale",
        budgetLabel: "Budget / tempi",
        materialsLabel: "Processo attuale",
        extrasLabel: "Funzioni richieste",
      };
    case "landing-page":
    case "advertising":
      return {
        goalLabel: "Obiettivo landing page",
        budgetLabel: "Budget / avvio",
        materialsLabel: "Landing / asset",
        extrasLabel: "Asset richiesti",
      };
    case "sito-vetrina":
    default:
      return {
        goalLabel: "Obiettivo sito",
        budgetLabel: "Budget / timeline",
        materialsLabel: "Materiali",
        extrasLabel: "Asset e canali",
      };
  }
}

export default function AdminWebAgencyProjectsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState<AdminWebAgencyProject[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [operatorNotesDrafts, setOperatorNotesDrafts] = useState<Record<number, string>>({});
  const [quoteNotes, setQuoteNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminWebAgencyProjects(token);
        if (!active) return;
        setProjects(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento progetti web agency");
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const byStatus = statusFilter === "all" || project.projectStatus === statusFilter;
        const byType = typeFilter === "all" || project.projectType === typeFilter;
        const haystack = [
          project.customerName,
          project.email,
          project.phone,
          project.businessSector,
          project.projectGoal,
          project.notes,
          project.clientCompanyName,
          project.clientUsername,
        ]
          .join(" ")
          .toLowerCase();
        const bySearch = searchQuery.trim() === "" || haystack.includes(searchQuery.trim().toLowerCase());
        return byStatus && byType && bySearch;
      }),
    [projects, searchQuery, statusFilter, typeFilter],
  );

  const metrics = useMemo(() => {
    const total = projects.length;
    const nuove = projects.filter((project) => project.projectStatus === "nuova").length;
    const offerte = projects.filter((project) => project.projectStatus === "offerta").length;
    const inLavorazione = projects.filter((project) => project.projectStatus === "in_lavorazione").length;
    return { total, nuove, offerte, inLavorazione };
  }, [projects]);

  const onProjectStatusChange = async (requestId: number, nextStatus: string) => {
    setSavingId(requestId);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const project = projects.find((item) => item.requestId === requestId);
      const note = operatorNotesDrafts[requestId] ?? project?.operatorNotes ?? "";
      await updateAdminWebAgencyProjectStatus(token, requestId, nextStatus, note);
      setProjects((current) =>
        current.map((project) =>
          project.requestId === requestId
            ? { ...project, projectStatus: nextStatus, operatorNotes: note }
            : project,
        ),
      );
      setMessage(`Progetto #${requestId} aggiornato a ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore aggiornamento progetto");
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
      const result = await uploadAdminWebAgencyQuote(token, requestId, file, note);

      setProjects((current) =>
        current.map((project) =>
          project.requestId === requestId
            ? {
                ...project,
                projectStatus: "offerta",
                quote: result.quote,
              }
            : project,
        ),
      );
      setMessage(result.message || `Proposta inviata per progetto #${requestId}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore invio proposta");
    } finally {
      setUploadingId(null);
    }
  };

  const onSaveOperatorNotes = async (requestId: number) => {
    const project = projects.find((item) => item.requestId === requestId);
    if (!project) return;

    setSavingId(requestId);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const note = operatorNotesDrafts[requestId] ?? project.operatorNotes ?? "";
      await updateAdminWebAgencyProjectStatus(token, requestId, project.projectStatus, note);
      setProjects((current) =>
        current.map((item) =>
          item.requestId === requestId ? { ...item, operatorNotes: note } : item,
        ),
      );
      setMessage(`Note operatore salvate per progetto #${requestId}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore salvataggio note operatore");
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando i brief Web Agency...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-600">{message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Brief Web Agency</p>
        <p className="mt-3 text-sm text-slate-600">
          Brief visibili: <strong className="text-slate-950">{filteredProjects.length}</strong> su{" "}
          <strong className="text-slate-950">{projects.length}</strong> totali.
        </p>
        {message ? <p className="mt-3 text-sm font-medium text-cyan-700">{message}</p> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <AdminMetricCard eyebrow="Totali" value={metrics.total} />
          <AdminMetricCard eyebrow="Nuove" value={metrics.nuove} />
          <AdminMetricCard eyebrow="Offerte" value={metrics.offerte} />
          <AdminMetricCard eyebrow="In lavorazione" value={metrics.inLavorazione} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Cerca cliente o progetto
            </span>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome, email, telefono, settore, azienda, obiettivo..."
              className="rounded-full"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro progetto
            </span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none"
            >
              <option value="all">Tutti i progetti</option>
              <option value="sito-vetrina">Sito vetrina</option>
              <option value="ecommerce">E-commerce</option>
              <option value="seo-local">SEO locale</option>
              <option value="gestionale">Gestionale</option>
              <option value="landing-page">Landing page</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro stato
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none"
            >
              <option value="all">Tutti gli stati</option>
              {PROJECT_STATUS_OPTIONS.map((statusOption) => (
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
        {filteredProjects.length === 0 ? (
          <AdminEmptyState title="Nessun brief trovato" description="Con i filtri attuali non risultano progetti visibili." />
        ) : null}
        {filteredProjects.map((project) => {
          const labels = getProjectLabels(project.projectType);
          const siteState = project.hasExistingSite ? "Sito esistente" : "Nuovo progetto";
          const extras = [
            project.needsBranding ? "Branding" : null,
            project.needsSeo ? "SEO" : null,
            project.needsAdvertising ? "Asset aggiuntivi" : null,
          ].filter(Boolean);

          return (
          <div key={project.requestId} className="glass-card rounded-4xl p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    #{project.requestId}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${projectTypeClassName(project.projectType)}`}
                  >
                    {formatProjectType(project.projectType)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white">{project.customerName}</h2>
                <p className="text-sm text-slate-300">
                  {project.email}
                  {project.phone ? ` • ${project.phone}` : ""}
                  {project.businessSector ? ` • ${project.businessSector}` : ""}
                </p>
                <p className="text-sm text-slate-400">
                  Creato: {formatDate(project.createdAt)}
                  {project.updatedAt ? ` • Aggiornato: ${formatDate(project.updatedAt)}` : ""}
                </p>
                <p className="text-xs text-slate-400">
                  Richiesta: {project.requestStatus || "brief-new"}
                  {project.clientUsername ? ` • Accesso: ${project.clientUsername}` : ""}
                  {project.clientCompanyName ? ` • Azienda: ${project.clientCompanyName}` : ""}
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <select
                  value={project.projectStatus}
                  onChange={(event) => onProjectStatusChange(project.requestId, event.target.value)}
                  disabled={savingId === project.requestId}
                  className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                >
                  {PROJECT_STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${projectStatusClassName(project.projectStatus)}`}
                >
                  {formatProjectStatus(project.projectStatus)}
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.email ? (
                    <a
                      href={`mailto:${project.email}`}
                      className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                    >
                      Email
                    </a>
                  ) : null}
                  {project.phone ? (
                    <a
                      href={`https://wa.me/${project.phone.replace(/\\D+/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{labels.goalLabel}</p>
                <p className="mt-2 text-sm text-slate-200">{project.projectGoal || "Non indicato"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{labels.budgetLabel}</p>
                <p className="mt-2 text-sm text-slate-200">{project.budgetRange || "-"}</p>
                <p className="text-xs text-slate-400">{project.timeline || "-"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{labels.materialsLabel}</p>
                <p className="mt-2 text-sm text-slate-200">
                  {project.projectType === "gestionale"
                    ? project.existingSiteUrl || "Processo non indicato"
                    : project.materialsReady || "Non indicati"}
                </p>
                {(project.existingSiteUrl && project.projectType !== "gestionale") || project.hasExistingSite ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {siteState}
                    {project.existingSiteUrl ? ` • ${project.existingSiteUrl}` : ""}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contatto preferito</p>
                <p className="mt-2 text-sm text-slate-200">{project.contactPreference || "Indifferente"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{labels.extrasLabel}</p>
                <p className="mt-2 text-sm text-slate-200">
                  {extras.length ? extras.join(", ") : "Nessun extra indicato"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Note cliente</p>
                <p className="mt-2 text-sm text-slate-200">{project.notes || "Nessuna nota"}</p>
              </div>
            </div>

            <div className="admin-adaptive-top-grid mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Note operatore</p>
                <textarea
                  value={operatorNotesDrafts[project.requestId] ?? project.operatorNotes ?? ""}
                  onChange={(event) =>
                    setOperatorNotesDrafts((current) => ({ ...current, [project.requestId]: event.target.value }))
                  }
                  rows={4}
                  placeholder="Qualifica commerciale, priorità, prossimi passi, vincoli emersi..."
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void onSaveOperatorNotes(project.requestId)}
                    disabled={savingId === project.requestId}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingId === project.requestId ? "Salvataggio..." : "Salva note"}
                  </button>
                  {project.operatorNotes ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                      Note presenti
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Invio proposta</p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={quoteNotes[project.requestId] ?? project.quote?.note ?? ""}
                  onChange={(event) =>
                    setQuoteNotes((current) => ({ ...current, [project.requestId]: event.target.value }))
                  }
                  placeholder="Messaggio breve da associare alla proposta"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                />
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500">
                  {uploadingId === project.requestId ? "Invio..." : "Allega proposta"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(event) => {
                      void onUploadQuote(project.requestId, event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              {project.quote?.url ? (
                <p className="mt-3 text-sm text-cyan-200">
                  Proposta inviata:{" "}
                  <a className="underline" href={project.quote.url} target="_blank" rel="noreferrer">
                    {project.quote.fileName || "Apri file"}
                  </a>
                  {project.quote.sentAt ? ` • ${formatDate(project.quote.sentAt)}` : ""}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Nessuna proposta allegata al momento.</p>
              )}
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
