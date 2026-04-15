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

interface AdminPhotocopyRequest {
  id: number;
  area: string;
  status: string;
  customerName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  details?: {
    residentCity?: string;
    clientUsername?: string;
    pdfUrl?: string;
    pageCount?: number;
    unitPriceCents?: number;
    pickupMode?: string;
    clientCompanyName?: string;
  };
}

const STATUS_OPTIONS = ["pending_payment", "processing", "completed", "cancelled"];

export default function AdminPhotocopyDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<AdminPhotocopyRequest[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
        setRequests((allRequests as AdminPhotocopyRequest[]).filter((item) => item.area === "fotocopie-online"));
        setPayments(allPayments);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento fotocopie");
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  const paymentsByRequestId = useMemo(() => new Map(payments.map((payment) => [payment.requestId, payment])), [payments]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const haystack = [
        request.customerName,
        request.email,
        request.phone,
        String(request.details?.residentCity || ""),
        String(request.details?.clientUsername || ""),
      ]
        .join(" ")
        .toLowerCase();
      const bySearch = searchTerm.trim() === "" || haystack.includes(searchTerm.trim().toLowerCase());
      const byStatus = statusFilter === "all" || request.status === statusFilter;
      return bySearch && byStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    return {
      total: requests.length,
      paid: requests.filter((request) => (paymentsByRequestId.get(request.id)?.paymentStatus || "") === "paid").length,
      ready: requests.filter((request) => request.status === "completed").length,
      inProcessing: requests.filter((request) => request.status === "processing").length,
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
          request.id === requestId ? { ...request, status: nextStatus, updatedAt: new Date().toISOString() } : request,
        ),
      );
      setMessage(`Ordine fotocopie #${requestId} aggiornato a ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore aggiornamento ordine");
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando le fotocopie online...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-600">{message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard eyebrow="Totali" value={metrics.total} description="Ordini registrati" />
        <AdminMetricCard eyebrow="Pagati" value={metrics.paid} description="Pagamenti confermati" />
        <AdminMetricCard eyebrow="In lavorazione" value={metrics.inProcessing} description="Ordini da produrre" />
        <AdminMetricCard eyebrow="Pronti al ritiro" value={metrics.ready} description="Ordini chiusi" />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        {message ? <p className="mb-4 text-sm font-medium text-cyan-700">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block md:col-span-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Cerca ordine</span>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cliente, email, città, username..." className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Stato</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none">
              <option value="all">Tutti</option>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{filteredRequests.length} ordini visibili</span>
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <AdminEmptyState
          title="Nessun ordine trovato"
          description="Con i filtri correnti non ci sono ordini fotocopie visibili. Allarga la ricerca o reimposta lo stato."
        />
      ) : null}

      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const payment = paymentsByRequestId.get(request.id);
          return (
            <article key={request.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Fotocopie #{request.id}</p>
                  <h2 className="text-2xl font-semibold text-slate-950">{request.customerName}</h2>
                  <p className="text-sm text-slate-600">{request.email}{request.phone ? ` • ${request.phone}` : ""}</p>
                  <div className="flex flex-wrap gap-2">
                    {request.email ? <a href={`mailto:${request.email}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">Email</a> : null}
                    {request.phone ? <a href={`https://wa.me/${request.phone.replace(/\D+/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">WhatsApp</a> : null}
                    {request.details?.pdfUrl ? <a href={String(request.details.pdfUrl)} target="_blank" rel="noreferrer" className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">Apri PDF</a> : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={request.status} onChange={(event) => void onUpdateStatus(request.id, event.target.value)} disabled={savingId === request.id} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none">
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <AdminStatusBadge label="Ordine" value={request.status} />
                  <AdminStatusBadge label="Pagamento" value={payment?.paymentStatus || payment?.checkoutStatus || "missing"} />
                </div>
              </div>

              <div className="admin-adaptive-kpi-grid mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pagine</p><p className="mt-2 text-sm font-semibold text-slate-900">{String(request.details?.pageCount || "n/d")}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Prezzo unitario</p><p className="mt-2 text-sm font-semibold text-slate-900">{request.details?.unitPriceCents ? `${(Number(request.details.unitPriceCents) / 100).toFixed(2).replace(".", ",")} EUR` : "n/d"}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Totale</p><p className="mt-2 text-sm font-semibold text-slate-900">{payment ? `${(payment.amountCents / 100).toFixed(2).replace(".", ",")} ${payment.currency.toUpperCase()}` : "n/d"}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ritiro</p><p className="mt-2 text-sm font-semibold text-slate-900">{String(request.details?.pickupMode || "ritiro_in_agenzia")}</p><p className="mt-1 text-xs text-slate-500">{String(request.details?.residentCity || "n/d")}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Cliente</p><p className="mt-2 text-sm font-semibold text-slate-900">{String(request.details?.clientUsername || "guest")}</p><p className="mt-1 text-xs text-slate-500">{String(request.details?.clientCompanyName || "privato")}</p></div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Timeline ordine</p>
                <div className="mt-3 grid gap-2 md:grid-cols-4 text-sm text-slate-600">
                  <p><strong className="text-slate-900">Creata:</strong> {new Date(request.createdAt).toLocaleString("it-IT")}</p>
                  <p><strong className="text-slate-900">Aggiornata:</strong> {new Date(request.updatedAt).toLocaleString("it-IT")}</p>
                  <p><strong className="text-slate-900">Checkout:</strong> {payment?.checkoutStatus || "n/d"}</p>
                  <p><strong className="text-slate-900">Pagamento:</strong> {payment?.paymentStatus || "n/d"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
