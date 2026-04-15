"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminClientAreaPayments,
  fetchAdminClientAreaRequests,
  getAdminPortalToken,
  updateAdminClientAreaRequestStatus,
  type AdminPaymentRecord,
} from "@/lib/admin-portal-auth";
import { AdminEmptyState, AdminMetricCard, AdminStatusBadge } from "@/components/admin-area/AdminUi";

interface AdminShipmentRequest {
  id: number;
  area: string;
  status: string;
  customerName: string;
  email: string;
  phone?: string;
  serviceType?: string;
  trackingCode?: string;
  parcelId?: string;
  manifestCreated?: boolean;
  manifestMessage?: string;
  createdAt: string;
  updatedAt: string;
  details?: {
    destinationCompanyName?: string;
    destinationCity?: string;
    destinationCountry?: string;
    clientUsername?: string;
    clientCompanyName?: string;
    weightKG?: number;
    volumetricWeightKG?: number;
  };
}

const STATUS_OPTIONS = [
  "new",
  "processing",
  "submitted_to_brt",
  "confirmed_by_brt",
  "completed",
  "cancelled",
];

export default function AdminShipmentsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<AdminShipmentRequest[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const [allRequests, allPayments] = await Promise.all([
          fetchAdminClientAreaRequests(token),
          fetchAdminClientAreaPayments(token),
        ]);
        if (!active) return;
        setRequests((allRequests as AdminShipmentRequest[]).filter((item) => item.area === "spedizioni"));
        setPayments(allPayments);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento spedizioni");
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  const paymentsByRequestId = useMemo(() => {
    return new Map(payments.map((payment) => [payment.requestId, payment]));
  }, [payments]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const payment = paymentsByRequestId.get(request.id);
      const haystack = [
        request.customerName,
        request.email,
        request.phone,
        request.serviceType,
        String(request.details?.destinationCompanyName || ""),
        String(request.details?.destinationCity || ""),
        String(request.details?.destinationCountry || ""),
        request.trackingCode,
        request.parcelId,
        String(request.details?.clientUsername || ""),
        String(request.details?.clientCompanyName || ""),
      ]
        .join(" ")
        .toLowerCase();

      const bySearch = searchTerm.trim() === "" || haystack.includes(searchTerm.trim().toLowerCase());
      const byStatus = statusFilter === "all" || request.status === statusFilter;
      const paymentState = payment?.paymentStatus || payment?.checkoutStatus || "missing";
      const byPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && paymentState === "paid") ||
        (paymentFilter === "pending" && paymentState !== "paid");

      return bySearch && byStatus && byPayment;
    });
  }, [paymentFilter, paymentsByRequestId, requests, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const paid = requests.filter((request) => {
      const payment = paymentsByRequestId.get(request.id);
      return (payment?.paymentStatus || payment?.checkoutStatus || "") === "paid";
    }).length;
    return {
      total: requests.length,
      open: requests.filter((request) => request.status !== "completed" && request.status !== "cancelled")
        .length,
      paid,
      manifests: requests.filter((request) => request.manifestCreated).length,
    };
  }, [paymentsByRequestId, requests]);

  const onUpdateStatus = async (requestId: number, nextStatus: string) => {
    setSavingId(requestId);
    setMessage("");
    try {
      const token = getAdminPortalToken();
      await updateAdminClientAreaRequestStatus(token, requestId, nextStatus);
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: nextStatus, updatedAt: new Date().toISOString() }
            : request,
        ),
      );
      setMessage(`Spedizione #${requestId} aggiornata a ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore aggiornamento spedizione");
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando le spedizioni...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-600">{message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard eyebrow="Totali" value={metrics.total} description="Spedizioni registrate" />
        <AdminMetricCard eyebrow="Aperte" value={metrics.open} description="Pratiche non chiuse" />
        <AdminMetricCard eyebrow="Pagate" value={metrics.paid} description="Incassi confermati" />
        <AdminMetricCard eyebrow="Manifest" value={metrics.manifests} description="Driver manifest generati" />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        {message ? <p className="mb-4 text-sm font-medium text-cyan-700">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block md:col-span-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Cerca spedizione
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cliente, email, tracking, destinazione, username..."
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Stato pratica
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="all">Tutti</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Stato pagamento
            </span>
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="all">Tutti</option>
              <option value="paid">Pagate</option>
              <option value="pending">Da verificare</option>
            </select>
          </label>
          <div className="flex items-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {filteredRequests.length} spedizioni visibili
            </span>
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <AdminEmptyState
          title="Nessuna spedizione trovata"
          description="Con i filtri attuali non ci sono pratiche logistiche da mostrare. Prova ad allargare ricerca, stato o pagamento."
        />
      ) : null}

      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const payment = paymentsByRequestId.get(request.id);
          return (
            <article
              key={request.id}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Spedizione #{request.id}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-950">{request.customerName}</h2>
                  <p className="text-sm text-slate-600">
                    {request.email}
                    {request.phone ? ` • ${request.phone}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {request.email ? (
                      <a
                        href={`mailto:${request.email}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        Email
                      </a>
                    ) : null}
                    {request.phone ? (
                      <a
                        href={`https://wa.me/${request.phone.replace(/\D+/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={request.status}
                    onChange={(event) => void onUpdateStatus(request.id, event.target.value)}
                    disabled={savingId === request.id}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <AdminStatusBadge label="Pagamento" value={payment?.paymentStatus || payment?.checkoutStatus || "missing"} />
                  <AdminStatusBadge label="Pratica" value={request.status} />
                </div>
              </div>

              <div className="admin-adaptive-kpi-grid mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tracking</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{request.trackingCode || "non assegnato"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Destinazione</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {String(request.details?.destinationCity || "n/d")}
                    {request.details?.destinationCountry ? ` (${String(request.details.destinationCountry)})` : ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Peso</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {String(request.details?.weightKG || "n/d")} kg
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Volumetrico: {String(request.details?.volumetricWeightKG || "n/d")}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tariffa</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{payment?.priceLabel || "n/d"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {payment ? `${(payment.amountCents / 100).toFixed(2).replace(".", ",")} ${payment.currency.toUpperCase()}` : "importo non disponibile"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Manifest</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {request.manifestCreated ? "generato" : "da verificare"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{request.manifestMessage || "nessun messaggio"}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Timeline pratica</p>
                <div className="mt-3 grid gap-2 md:grid-cols-4 text-sm text-slate-600">
                  <p><strong className="text-slate-900">Creata:</strong> {new Date(request.createdAt).toLocaleString("it-IT")}</p>
                  <p><strong className="text-slate-900">Aggiornata:</strong> {new Date(request.updatedAt).toLocaleString("it-IT")}</p>
                  <p><strong className="text-slate-900">Cliente:</strong> {String(request.details?.clientUsername || "guest")}</p>
                  <p><strong className="text-slate-900">Parcel:</strong> {request.parcelId || "n/d"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
