"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminClientAreaRequests,
  fetchAdminShippingPricing,
  getAdminPortalToken,
  type ShippingPricingRule,
} from "@/lib/admin-portal-auth";

type AdminRequest = {
  id: number;
  area: string;
  status: string;
};

export default function AdminDashboardOverview() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [rules, setRules] = useState<ShippingPricingRule[]>([]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const [requestPayload, pricingPayload] = await Promise.all([
          fetchAdminClientAreaRequests(token),
          fetchAdminShippingPricing(token),
        ]);

        if (!active) return;
        setRequests(requestPayload as AdminRequest[]);
        setRules(pricingPayload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento dashboard");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const toWork = requests.filter(
      (request) => request.status === "new" || request.status === "processing",
    ).length;
    const openShipments = requests.filter(
      (request) =>
        request.area === "spedizioni" &&
        request.status !== "completed" &&
        request.status !== "cancelled",
    ).length;
    const activeRules = rules.filter((rule) => rule.active).length;

    return {
      totalRequests,
      toWork,
      openShipments,
      activeRules,
    };
  }, [requests, rules]);

  if (status === "loading") {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-sm text-slate-500">Sto caricando i numeri principali...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
          Dashboard non allineata
        </p>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#d9e6ff] bg-[linear-gradient(120deg,#11285b_0%,#1f47a8_58%,#3e6ee9_100%)] p-6 text-white shadow-[0_20px_55px_rgba(37,99,235,0.22)] md:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Dashboard Operativa
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Bentornato, qui vedo subito cosa richiede attenzione.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
              La home adesso mi mostra i numeri utili: richieste in ingresso, spedizioni aperte e
              scaglioni attivi. Entro nelle sezioni laterali solo quando devo lavorare nel dettaglio.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/12 bg-white/12 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                Richieste totali
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.totalRequests}</p>
              <p className="mt-2 text-sm text-blue-100">Pratiche presenti nel portale</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/12 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                Da lavorare
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.toWork}</p>
              <p className="mt-2 text-sm text-blue-100">Nuove o in lavorazione</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/12 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                Spedizioni aperte
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.openShipments}</p>
              <p className="mt-2 text-sm text-blue-100">Da seguire o chiudere</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/12 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                Regole attive
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.activeRules}</p>
              <p className="mt-2 text-sm text-blue-100">Scaglioni listino disponibili</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Indicatori Principali
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Vista rapida per capire dove entrare adesso.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Agg. live
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Totali
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.totalRequests}</p>
              <p className="mt-2 text-sm text-slate-500">Richieste complessive</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Operative
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.toWork}</p>
              <p className="mt-2 text-sm text-slate-500">Richieste da lavorare</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Spedizioni
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.openShipments}</p>
              <p className="mt-2 text-sm text-slate-500">Aperte e non chiuse</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Listino
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{stats.activeRules}</p>
              <p className="mt-2 text-sm text-slate-500">Regole attive</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Azioni Rapide
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Entro subito nel punto giusto senza cercare.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              href="/area-admin/richieste"
              className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <span>
                <span className="block text-sm font-semibold text-slate-950">Apri richieste</span>
                <span className="mt-1 block text-xs text-slate-500">
                  Qui aggiorno stati e pratiche
                </span>
              </span>
              <span className="text-sm font-semibold text-cyan-700">Vai</span>
            </Link>
            <Link
              href="/area-admin/listino-spedizioni"
              className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <span>
                <span className="block text-sm font-semibold text-slate-950">Apri listino</span>
                <span className="mt-1 block text-xs text-slate-500">
                  Qui imposto costi per peso e volume
                </span>
              </span>
              <span className="text-sm font-semibold text-cyan-700">Vai</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
