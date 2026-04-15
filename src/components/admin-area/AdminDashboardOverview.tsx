"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  createdAt?: string;
};

const quickModules = [
  {
    href: "/area-admin/richieste",
    eyebrow: "Operativo",
    title: "Richieste clienti",
    description: "Pratiche, stati e dettagli cliente in lavorazione.",
  },
  {
    href: "/area-admin/spedizioni",
    eyebrow: "Logistica",
    title: "Cockpit spedizioni",
    description: "Tracking, pagamenti, manifest e monitoraggio ordini.",
  },
  {
    href: "/area-admin/consulenza-utenze",
    eyebrow: "Commerciale",
    title: "Lead consulenze",
    description: "Telefonia, luce e gas con follow-up e preventivi.",
  },
  {
    href: "/area-admin/web-agency",
    eyebrow: "Progetti",
    title: "Web Agency",
    description: "Brief digitali, offerte e pipeline commerciale.",
  },
];

function areaLabel(area: string) {
  switch (area) {
    case "spedizioni":
      return "Spedizioni";
    case "visure":
      return "Visure";
    case "caf-patronato":
      return "CAF/Patronato";
    case "consulenza-utenze":
      return "Consulenza Utenze";
    case "fotocopie-online":
      return "Fotocopie";
    default:
      return area || "Richiesta";
  }
}

function formatDate(value?: string) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

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
    const completed = requests.filter((request) => request.status === "completed").length;

    return {
      totalRequests,
      toWork,
      openShipments,
      activeRules,
      completed,
    };
  }, [requests, rules]);

  const latestRequests = useMemo(
    () => [...requests].slice(0, 6),
    [requests],
  );

  const statusBreakdown = useMemo(
    () => [
      { label: "Nuove", value: requests.filter((request) => request.status === "new").length },
      {
        label: "In lavorazione",
        value: requests.filter((request) => request.status === "processing").length,
      },
      {
        label: "Completate",
        value: requests.filter((request) => request.status === "completed").length,
      },
      {
        label: "Annullate",
        value: requests.filter((request) => request.status === "cancelled").length,
      },
    ],
    [requests],
  );

  if (status === "loading") {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <p className="text-sm text-slate-500">Sto caricando il quadro operativo...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="rounded-2xl border-red-200">
        <CardContent className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Dashboard non allineata
          </p>
          <p className="mt-3 text-sm text-slate-600">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-adaptive-top-grid grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.95fr)]">
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
          <CardContent className="p-6 xl:p-7">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Dashboard Operativa
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950 2xl:text-3xl">
                Ciao, benvenuto: qui trovi subito priorita, carico operativo e stato del backoffice.
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 2xl:text-base">
                In questa panoramica vedi al volo cosa richiede attenzione, quante pratiche sono in
                coda e dove si concentra il lavoro di oggi.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Stato Giornata
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Priorita operative</p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Backoffice attivo
              </Badge>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Da lavorare
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.toWork}</p>
                <p className="mt-2 text-sm text-slate-500">Richieste nuove o in processing</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Spedizioni aperte
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.openShipments}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Regole attive
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.activeRules}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="admin-adaptive-kpi-grid grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Richieste totali", stats.totalRequests, "Volume pratiche presente nel portale"],
          ["Da lavorare", stats.toWork, "Nuove o in lavorazione"],
          ["Spedizioni aperte", stats.openShipments, "Ordini non chiusi"],
          ["Completate", stats.completed, "Pratiche evase"],
          ["Listino attivo", stats.activeRules, "Regole spedizione utilizzabili"],
        ].map(([title, value, description]) => (
          <Card key={title} className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {title}
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="admin-adaptive-ops-grid grid gap-5 2xl:grid-cols-[1.35fr_1fr_0.9fr]">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Operativo Oggi
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ultime pratiche entrate o ancora da chiudere.
                </p>
              </div>
              <Link href="/area-admin/richieste">
                <Button variant="outline" className="rounded-full">
                  Tutte le richieste
                </Button>
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {latestRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                  Nessuna richiesta disponibile.
                </div>
              ) : (
                latestRequests.map((request) => (
                  <div
                    key={`${request.area}-${request.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950">
                        #{request.id} {areaLabel(request.area)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Stato {request.status} • {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <Badge className="border-slate-200 bg-white text-slate-700">
                      {request.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Breakdown Stati
            </p>
            <div className="mt-5 space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-950">{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{
                        width: `${stats.totalRequests > 0 ? Math.max((item.value / stats.totalRequests) * 100, 6) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Sistema
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Accesso rapido
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/area-admin/notifiche-email"><Button variant="outline" size="sm" className="rounded-full">Email</Button></Link>
                  <Link href="/area-admin/listino-spedizioni"><Button variant="outline" size="sm" className="rounded-full">Listino sped.</Button></Link>
                  <Link href="/area-admin/listino-visure"><Button variant="outline" size="sm" className="rounded-full">Listino visure</Button></Link>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Operatore
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">Carmine Cavaliere</p>
                <p className="mt-1 text-sm text-slate-500">Backoffice AG Servizi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="admin-adaptive-modules-grid grid gap-5 xl:grid-cols-4">
        {quickModules.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  {item.eyebrow}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
