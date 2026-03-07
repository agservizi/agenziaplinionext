"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminClientAreaPayments,
  getAdminPortalToken,
  type AdminPaymentRecord,
} from "@/lib/admin-portal-auth";

export default function AdminPaymentsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);

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
      <div className="rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-medium text-red-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Pagamenti</p>
        <p className="mt-3 text-sm text-slate-600">
          Qui vedo i pagamenti Stripe collegati alle spedizioni, con stato pagamento e avanzamento
          fattura.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-600">Non ci sono ancora pagamenti registrati.</p>
        </div>
      ) : null}

      {payments.map((payment) => (
        <div
          key={payment.id}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
        >
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
              <p className="mt-1 text-sm text-slate-500">
                Registrato il {new Date(payment.createdAt).toLocaleString("it-IT")}
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Importo
              </p>
              <p className="mt-2 text-base font-semibold text-cyan-950">
                {(payment.amountCents / 100).toFixed(2).replace(".", ",")}{" "}
                {payment.currency.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Stato pagamento
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {payment.paymentStatus || payment.checkoutStatus || "n/d"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Stato richiesta
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{payment.requestStatus || "n/d"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Tariffa
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{payment.priceLabel || "n/d"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Fattura
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{payment.invoiceStatus || "n/d"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
        </div>
      ))}
    </div>
  );
}
