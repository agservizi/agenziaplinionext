"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminEmailNotifications,
  getAdminPortalToken,
  type AdminEmailNotificationRecord,
} from "@/lib/admin-portal-auth";

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

export default function AdminEmailNotificationsDashboard() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<AdminEmailNotificationRecord[]>([]);
  const [areaFilter, setAreaFilter] = useState("all");
  const [sendStatusFilter, setSendStatusFilter] = useState("all");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setStatus("loading");
        setMessage("");
        const token = getAdminPortalToken();
        const payload = await fetchAdminEmailNotifications(token, {
          area: areaFilter,
          status: sendStatusFilter,
        });
        if (!active) return;
        setNotifications(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Errore caricamento notifiche email",
        );
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [areaFilter, sendStatusFilter]);

  const counters = useMemo(() => {
    let sent = 0;
    let failed = 0;

    for (const item of notifications) {
      if (item.sendStatus === "sent") {
        sent += 1;
      } else {
        failed += 1;
      }
    }

    return {
      total: notifications.length,
      sent,
      failed,
    };
  }, [notifications]);

  if (status === "loading") {
    return <p className="text-sm text-slate-300">Sto caricando le notifiche email...</p>;
  }

  if (status === "error") {
    return <p className="text-sm font-medium text-red-400">{message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Audit notifiche email
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Totale: <strong className="text-white">{counters.total}</strong> · Inviate:{" "}
          <strong className="text-emerald-300">{counters.sent}</strong> · Fallite:{" "}
          <strong className="text-rose-300">{counters.failed}</strong>
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro area
            </span>
            <select
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="all">Tutte le aree</option>
              <option value="spedizioni">Spedizioni</option>
              <option value="visure">Visure</option>
              <option value="consulenza-utenze">Consulenza utenze</option>
              <option value="caf-patronato">CAF/Patronato</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Filtro esito
            </span>
            <select
              value={sendStatusFilter}
              onChange={(event) => setSendStatusFilter(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="all">Tutti gli esiti</option>
              <option value="sent">Inviate</option>
              <option value="failed">Fallite</option>
            </select>
          </label>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card rounded-4xl p-6">
          <p className="text-sm text-slate-300">Nessuna notifica email trovata con questi filtri.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/50">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Area</th>
                <th className="px-4 py-3 font-semibold">Evento</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Esito</th>
                <th className="px-4 py-3 font-semibold">Dettagli errore</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((item) => (
                <tr key={item.id} className="border-t border-white/10 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">{item.area || "-"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{item.title || "Evento"}</p>
                    <p className="mt-1 text-xs text-slate-400">ID provider: {item.providerMessageId || "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{item.customerName || "n/d"}</p>
                    <p className="text-xs text-slate-400">{item.customerEmail || ""}</p>
                    <p className="text-xs text-slate-400">{item.customerPhone || ""}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        item.sendStatus === "sent"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {item.sendStatus || "failed"}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">{item.sendReason || "-"}</p>
                    <p className="text-xs text-slate-500">HTTP {item.responseStatus || 0}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {item.errorMessage || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
