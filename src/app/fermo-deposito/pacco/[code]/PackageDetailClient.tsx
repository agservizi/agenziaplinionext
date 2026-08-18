"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import { FadeUp } from "@/components/motion/FadeUp";

type PackageStatus =
  | "PRENOTATO"
  | "IN_GIACENZA"
  | "CONSEGNATO"
  | "ANNULLATO"
  | "NO_SHOW";

type PackageDetail = {
  code: string;
  status: PackageStatus;
  statusLabel: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  carrier?: string;
  trackingCode?: string;
  expectedPickupDate: string;
  dailyRate: number;
  pickupUrl?: string;
  qrToken?: string;
  notes?: string;
};

type PageState = "loading" | "ready" | "error" | "not-found";

const STATUS_BADGE: Record<PackageStatus, string> = {
  PRENOTATO: "bg-[#5E0ED7]/15 text-purple-300 ring-1 ring-[#5E0ED7]/40",
  IN_GIACENZA: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40",
  CONSEGNATO: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40",
  ANNULLATO: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40",
  NO_SHOW: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/40",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="min-w-[140px] text-sm font-medium text-slate-400">{label}</dt>
      <dd className="text-sm text-white">{value}</dd>
    </div>
  );
}

function formatDate(date: string) {
  try {
    return new Date(date + "T12:00:00").toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export default function PackageDetailClient({ code }: { code: string }) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchPackage = useCallback(async () => {
    setPageState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/locker-point/packages/${encodeURIComponent(code)}`,
      );
      const json = await res.json();

      if (res.status === 404) {
        setPageState("not-found");
        return;
      }
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message ?? "Errore nel caricamento.");
      }

      const raw = json.data ?? json;
      setPkg({
        code: raw.code ?? code,
        status: raw.status ?? "PRENOTATO",
        statusLabel: raw.statusLabel ?? raw.status ?? "Prenotato",
        recipientName: raw.recipientName ?? "",
        recipientEmail: raw.recipientEmail,
        recipientPhone: raw.recipientPhone,
        carrier: raw.carrier,
        trackingCode: raw.trackingCode,
        expectedPickupDate: raw.expectedPickupDate ?? "",
        dailyRate: Number(raw.dailyRate ?? 0.5),
        pickupUrl: raw.pickupUrl,
        qrToken: raw.qrToken,
        notes: raw.notes,
      });
      setPageState("ready");
    } catch (err) {
      setPageState("error");
      setErrorMsg(err instanceof Error ? err.message : "Errore. Riprova.");
    }
  }, [code]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  async function handleCancel() {
    if (!pkg || pkg.status !== "PRENOTATO") return;
    if (!window.confirm("Vuoi annullare questa prenotazione?")) return;
    setCancelLoading(true);
    try {
      const res = await fetch(
        `/api/locker-point/packages/${encodeURIComponent(code)}/cancel`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message ?? "Annullamento non riuscito.");
      }
      await fetchPackage();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Errore nell'annullamento.");
    } finally {
      setCancelLoading(false);
    }
  }

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Caricamento pacco...</p>
      </main>
    );
  }

  if (pageState === "not-found") {
    return (
      <main className="min-h-screen bg-slate-950 pb-24 pt-32">
        <Container className="text-center">
          <h1 className="text-2xl font-bold text-white">Pacco non trovato</h1>
          <p className="mt-4 text-slate-400">
            Il codice {code} non esiste o non è più disponibile.
          </p>
          <Link
            href="/fermo-deposito/i-miei-pacchi"
            className="mt-8 inline-block text-cyan-400 hover:underline"
          >
            Cerca un altro pacco
          </Link>
        </Container>
      </main>
    );
  }

  if (pageState === "error" || !pkg) {
    return (
      <main className="min-h-screen bg-slate-950 pb-24 pt-32">
        <Container className="text-center">
          <p role="alert" className="text-rose-300">
            {errorMsg || "Errore imprevisto."}
          </p>
          <button
            type="button"
            onClick={fetchPackage}
            className="mt-6 rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950"
          >
            Riprova
          </button>
        </Container>
      </main>
    );
  }

  const badgeClass = STATUS_BADGE[pkg.status] ?? STATUS_BADGE.PRENOTATO;

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-2xl">
            <Link
              href="/fermo-deposito/i-miei-pacchi"
              className="text-sm text-cyan-400 hover:underline"
            >
              ← I miei pacchi
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{pkg.code}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                {pkg.statusLabel}
              </span>
            </div>
            <p className="mt-2 text-slate-400">
              Fermo deposito · AG SERVIZI Castellammare di Stabia
            </p>

            <div className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8">
              <dl className="space-y-4">
                <DetailRow label="Destinatario" value={pkg.recipientName} />
                <DetailRow label="Email" value={pkg.recipientEmail} />
                <DetailRow label="Telefono" value={pkg.recipientPhone} />
                <DetailRow label="Corriere" value={pkg.carrier} />
                <DetailRow label="Tracking" value={pkg.trackingCode} />
                <DetailRow
                  label="Ritiro previsto"
                  value={pkg.expectedPickupDate ? formatDate(pkg.expectedPickupDate) : null}
                />
                <DetailRow
                  label="Tariffa"
                  value={`€${pkg.dailyRate.toFixed(2).replace(".", ",")} / giorno`}
                />
                <DetailRow label="Note" value={pkg.notes} />
              </dl>

              {pkg.pickupUrl && (
                <a
                  href={pkg.pickupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Apri pagina ritiro
                </a>
              )}

              {pkg.status === "PRENOTATO" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="ml-4 inline-flex rounded-full border border-rose-500/40 px-6 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                >
                  {cancelLoading ? "Annullamento..." : "Annulla prenotazione"}
                </button>
              )}
            </div>
          </div>
        </FadeUp>
      </Container>
    </main>
  );
}
