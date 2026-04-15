"use client";

import { useEffect, useState } from "react";
import { AdminEmptyState, AdminMetricCard, AdminStatusBadge } from "@/components/admin-area/AdminUi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchAdminClientAreaRequests,
  getAdminPortalToken,
  updateAdminClientAreaRequestStatus,
} from "@/lib/admin-portal-auth";

type AdminRequest = {
  id: number;
  area: string;
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  details: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
  trackingCode: string;
  parcelId: string;
  manifestCreated: boolean;
  manifestMessage: string;
};

const STATUS_OPTIONS = [
  "new",
  "processing",
  "submitted_to_brt",
  "confirmed_by_brt",
  "completed",
  "cancelled",
];

export default function AdminRequestsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = (await fetchAdminClientAreaRequests(token)) as AdminRequest[];
        if (!active) return;
        setRequests(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento richieste");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const onUpdateStatus = async (id: number, nextStatus: string) => {
    setSavingId(id);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      await updateAdminClientAreaRequestStatus(token, id, nextStatus);
      setRequests((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item,
        ),
      );
      setMessage(`Richiesta #${id} aggiornata a ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore aggiornamento stato");
    } finally {
      setSavingId(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const areaMatches = areaFilter === "all" || request.area === areaFilter;
    const statusMatches = statusFilter === "all" || request.status === statusFilter;
    const haystack = [
      request.customerName,
      request.email,
      request.phone,
      request.serviceType,
      String(request.details?.destinationCompanyName || ""),
      String(request.details?.destinationCity || ""),
      String(request.trackingCode || ""),
      String(request.parcelId || ""),
      String(request.details?.clientUsername || ""),
      String(request.details?.clientCompanyName || ""),
    ]
      .join(" ")
      .toLowerCase();
    const searchMatches = searchTerm.trim() === "" || haystack.includes(searchTerm.trim().toLowerCase());
    return areaMatches && statusMatches && searchMatches;
  });
  const shippingRequests = filteredRequests.filter((request) => request.area === "spedizioni");
  const openShippingRequests = shippingRequests.filter(
    (request) => request.status !== "completed" && request.status !== "cancelled",
  );

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando le richieste...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-600">{message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Quadro Richieste
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Ho <strong className="text-slate-950">{filteredRequests.length}</strong> richieste nel filtro
          corrente su <strong className="text-slate-950">{requests.length}</strong> totali.
        </p>
        {message ? <p className="mt-3 text-sm font-medium text-cyan-700">{message}</p> : null}
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Cerca
            </span>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cliente, email, tracking, destinazione, username..."
              className="rounded-full"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro area
            </span>
            <select
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none"
            >
              <option value="all">Tutte le aree</option>
              <option value="spedizioni">Spedizioni</option>
              <option value="visure">Visure</option>
              <option value="caf-patronato">CAF e Patronato</option>
              <option value="consulenza-utenze">Consulenza utenze</option>
              <option value="fotocopie-online">Fotocopie online</option>
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
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard eyebrow="Spedizioni" value={shippingRequests.length} description="Richieste spedizioni nel filtro corrente" />
        <AdminMetricCard eyebrow="Spedizioni aperte" value={openShippingRequests.length} description="Non completate o annullate" />
        <AdminMetricCard eyebrow="Da lavorare" value={filteredRequests.filter((request) => request.status === "new" || request.status === "processing").length} description="Richieste in ingresso o in lavorazione" />
      </div>

      {shippingRequests.length > 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Spedizioni
          </p>
          <div className="mt-4 space-y-3">
            {shippingRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
              >
                <p className="font-semibold text-slate-950">
                  #{request.id} • {request.customerName}
                </p>
                <p className="mt-1">
                  {request.serviceType} • stato <strong>{request.status}</strong>
                </p>
                <p className="mt-1 text-slate-500">
                  {String(request.details?.destinationCity || "")}
                  {request.details?.destinationCountry
                    ? ` (${String(request.details.destinationCountry)})`
                    : ""}
                  {request.details?.weightKG ? ` • ${String(request.details.weightKG)} kg` : ""}
                  {request.details?.volumetricWeightKG
                    ? ` • vol. ${String(request.details.volumetricWeightKG)} kg`
                    : ""}
                </p>
                <p className="mt-1 text-slate-500">
                  {request.trackingCode ? `Tracking ${request.trackingCode}` : "Tracking non ancora assegnato"}
                  {request.parcelId ? ` • Parcel ${request.parcelId}` : ""}
                </p>
                <p
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${request.manifestCreated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {request.manifestCreated ? "Manifest driver generato" : "Manifest driver da verificare"}
                </p>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <AdminEmptyState title="Nessuna richiesta" description="Con i filtri attuali non risultano pratiche visibili." />
        ) : null}
        {filteredRequests.map((request) => (
          <div key={request.id} className="glass-card rounded-4xl p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  {request.area} • #{request.id}
                </p>
                <h2 className="text-xl font-semibold text-white">{request.customerName}</h2>
                <p className="text-sm text-slate-300">
                  {request.serviceType} • {request.email}
                  {request.phone ? ` • ${request.phone}` : ""}
                </p>
                {request.area === "spedizioni" ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    {request.trackingCode ? (
                      <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-cyan-200">
                        Tracking {request.trackingCode}
                      </span>
                    ) : null}
                    {request.parcelId ? (
                      <span className="rounded-full bg-slate-700/60 px-3 py-1 text-slate-200">
                        Parcel {request.parcelId}
                      </span>
                    ) : null}
                    {request.details?.clientUsername ? (
                      <span className="rounded-full bg-violet-500/15 px-3 py-1 text-violet-200">
                        {String(request.details.clientUsername)}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <p className="text-sm text-slate-400">
                  Creata: {new Date(request.createdAt).toLocaleString("it-IT")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {request.email ? (
                  <a
                    href={`mailto:${request.email}`}
                    className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200"
                  >
                    Email
                  </a>
                ) : null}
                {request.phone ? (
                  <a
                    href={`https://wa.me/${request.phone.replace(/\\D+/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200"
                  >
                    WhatsApp
                  </a>
                ) : null}
                <select
                  value={request.status}
                  onChange={(event) => onUpdateStatus(request.id, event.target.value)}
                  disabled={savingId === request.id}
                  className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <AdminStatusBadge value={request.status} />
              </div>
            </div>

            {request.notes ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Note</p>
                <p className="mt-2 text-sm text-slate-200">{request.notes}</p>
              </div>
            ) : null}

            {request.area === "spedizioni" ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Tracking
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {request.trackingCode || "Non ancora disponibile"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Parcel ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {request.parcelId || "Non disponibile"}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border p-4 ${
                    request.manifestCreated
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-amber-500/20 bg-amber-500/10"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                      request.manifestCreated ? "text-emerald-200" : "text-amber-200"
                    }`}
                  >
                    Manifest driver
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {request.manifestCreated ? "Generato" : "Da verificare"}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    {request.manifestMessage || "Nessun dettaglio disponibile."}
                  </p>
                </div>
              </div>
            ) : null}

            {request.details && Object.keys(request.details).length > 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Dettagli
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {Object.entries(request.details).map(([key, value]) => (
                    <div key={key} className="text-sm text-slate-200">
                      <strong className="text-white">{key}:</strong> {String(value)}
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
