"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchAdminClientAreaPayments,
  getAdminPortalToken,
  type AdminPaymentRecord,
} from "@/lib/admin-portal-auth";
import { AdminEmptyState, AdminMetricCard, AdminStatusBadge } from "@/components/admin-area/AdminUi";

export default function AdminPaymentsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminClientAreaPayments(token);
        if (!active) return;
        setPayments(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento pagamenti");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Sto caricando i pagamenti...</p>;
  }

  if (status === "error") {
    return (
      <Card className="rounded-xl border-red-100">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-red-600">{message}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredPayments = payments.filter((payment) => {
    const haystack = [
      payment.customerName,
      payment.email,
      payment.serviceType,
      payment.priceLabel,
      payment.stripeSessionId,
      payment.invoiceDocumentId,
    ]
      .join(" ")
      .toLowerCase();
    return searchTerm.trim() === "" || haystack.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard eyebrow="Totali" value={payments.length} description="Pagamenti registrati" />
        <AdminMetricCard eyebrow="Pagati" value={payments.filter((payment) => payment.paymentStatus === "paid").length} description="Confermati da Stripe" />
        <AdminMetricCard eyebrow="Con fattura" value={payments.filter((payment) => Boolean(payment.invoicePdfUrl)).length} description="Documento già disponibile" />
        <AdminMetricCard eyebrow="Da verificare" value={payments.filter((payment) => payment.paymentStatus !== "paid").length} description="Checkout o pagamento non chiusi" />
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Pagamenti</p>
          <p className="text-sm text-slate-600">
            Qui vedo i pagamenti Stripe collegati alle spedizioni, con stato pagamento e avanzamento
            fattura.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Cerca
            </span>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cliente, email, tariffa, sessione Stripe..."
              className="rounded-full bg-slate-50"
            />
          </label>
          <Badge className="rounded-full border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {filteredPayments.length} visibili
          </Badge>
        </CardContent>
      </Card>

      {filteredPayments.length === 0 ? (
        <AdminEmptyState
          title="Nessun pagamento trovato"
          description="Non risultano pagamenti compatibili con il filtro corrente. Prova a cercare con cliente, email o sessione Stripe."
        />
      ) : null}

      {filteredPayments.map((payment) => (
        <Card key={payment.id} className="rounded-xl">
          <CardContent className="p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Pagamento #{payment.id}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {payment.customerName || "Cliente non disponibile"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {payment.email || "email non disponibile"}
                {payment.serviceType ? ` • ${payment.serviceType}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {payment.email ? (
                  <a
                    href={`mailto:${payment.email}`}
                    className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Email cliente
                  </a>
                ) : null}
                {payment.invoicePdfUrl ? (
                  <a
                    href={payment.invoicePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700"
                  >
                    Apri fattura
                  </a>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Registrato il {new Date(payment.createdAt).toLocaleString("it-IT")}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Importo
              </p>
              <p className="mt-2 text-base font-semibold text-cyan-950">
                {(payment.amountCents / 100).toFixed(2).replace(".", ",")}{" "}
                {payment.currency.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="admin-adaptive-kpi-grid mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Stato pagamento
              </p>
                <div className="mt-2">
                  <AdminStatusBadge value={payment.paymentStatus || payment.checkoutStatus || "missing"} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Stato richiesta
              </p>
                <div className="mt-2">
                  <AdminStatusBadge value={payment.requestStatus || "missing"} />
                </div>
              </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Tariffa
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{payment.priceLabel || "n/d"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Fattura
              </p>
                <div className="mt-2">
                  <AdminStatusBadge value={payment.invoiceStatus || "missing"} />
                </div>
              </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Provider
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {payment.invoiceProvider || "pending"}
              </p>
              {payment.invoicePdfUrl ? (
                <a
                  href={payment.invoicePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs font-semibold text-cyan-700"
                >
                  Apri documento
                </a>
              ) : null}
            </div>
          </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
