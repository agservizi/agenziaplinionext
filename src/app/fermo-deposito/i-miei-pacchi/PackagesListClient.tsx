"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";
import { FadeUp } from "@/components/motion/FadeUp";

type PackageStatus =
  | "PRENOTATO"
  | "IN_GIACENZA"
  | "CONSEGNATO"
  | "ANNULLATO"
  | "NO_SHOW";

type PackageSummary = {
  code: string;
  expectedPickupDate: string;
  status: PackageStatus;
  statusLabel: string;
  recipientName: string;
  dailyRate: number;
};

type FetchState = "idle" | "loading" | "done" | "error";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STATUS_BADGE: Record<PackageStatus, string> = {
  PRENOTATO: "bg-[#5E0ED7]/15 text-purple-300 ring-1 ring-[#5E0ED7]/40",
  IN_GIACENZA: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40",
  CONSEGNATO: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40",
  ANNULLATO: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40",
  NO_SHOW: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/40",
};

const INPUT_CLASS =
  "w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-500";

export default function PackagesListClient() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchPackages(e: React.FormEvent) {
    e.preventDefault();
    setFetchState("loading");
    setErrorMsg("");

    try {
      const params = new URLSearchParams();
      if (mode === "code") {
        if (!code.trim()) return;
        params.set("code", code.trim().toUpperCase());
      } else {
        if (!email.trim() && !phone.trim()) return;
        if (email.trim()) params.set("email", email.trim());
        if (phone.trim()) params.set("phone", phone.trim());
      }

      const res = await fetch(`/api/locker-point/packages?${params}`);
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message ?? "Impossibile recuperare i pacchi.");
      }

      const wrapper = json.data ?? json;
      const list = Array.isArray(wrapper)
        ? wrapper
        : wrapper.packages ?? wrapper.items ?? wrapper.results ?? [];

      if (mode === "code" && list.length === 0 && wrapper.code) {
        window.location.href = `/fermo-deposito/pacco/${encodeURIComponent(wrapper.code)}`;
        return;
      }

      const mapped: PackageSummary[] = list.map((p: Record<string, unknown>) => ({
        code: String(p.code ?? ""),
        expectedPickupDate: String(p.expectedPickupDate ?? ""),
        status: (p.status ?? "PRENOTATO") as PackageStatus,
        statusLabel: String(p.statusLabel ?? p.status ?? "Prenotato"),
        recipientName: String(p.recipientName ?? ""),
        dailyRate: Number(p.dailyRate ?? 0.5),
      }));
      setPackages(mapped);
      setFetchState("done");
    } catch (err) {
      setFetchState("error");
      setErrorMsg(err instanceof Error ? err.message : "Errore. Riprova.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-32">
      <Container className="mb-12 text-center">
        <FadeUp>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">I miei pacchi</h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
            Cerca per email, telefono o codice LP per vedere le prenotazioni fermo deposito.
          </p>
        </FadeUp>
      </Container>

      <Container>
        <FadeUp delay={0.15}>
          <div className="mx-auto mb-6 flex max-w-md justify-center gap-2">
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "email"
                  ? "bg-cyan-500 text-slate-950"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Email / telefono
            </button>
            <button
              type="button"
              onClick={() => setMode("code")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "code"
                  ? "bg-cyan-500 text-slate-950"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Codice LP
            </button>
          </div>

          <form onSubmit={fetchPackages} className="mx-auto max-w-md space-y-3">
            {mode === "code" ? (
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={INPUT_CLASS}
                placeholder="LP-XXXXXX"
                aria-label="Codice pacco"
              />
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="La tua email"
                  aria-label="Email"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Telefono (opzionale)"
                  aria-label="Telefono"
                />
              </>
            )}
            <button
              type="submit"
              disabled={fetchState === "loading"}
              className="w-full rounded-full bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {fetchState === "loading" ? "Ricerca..." : "Cerca"}
            </button>
          </form>
        </FadeUp>
      </Container>

      {errorMsg && (
        <Container className="mt-8">
          <p role="alert" className="text-center text-sm text-rose-300">
            {errorMsg}
          </p>
        </Container>
      )}

      {fetchState === "done" && (
        <Container className="mt-12">
          {packages.length === 0 ? (
            <p className="text-center text-sm text-slate-500">Nessun pacco trovato.</p>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {packages.map((p, i) => (
                <motion.div
                  key={p.code}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                >
                  <Link
                    href={`/fermo-deposito/pacco/${encodeURIComponent(p.code)}`}
                    className="block rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-500/30 hover:bg-white/[0.07]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-lg font-bold text-cyan-400">{p.code}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[p.status]}`}
                      >
                        {p.statusLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{p.recipientName}</p>
                    {p.expectedPickupDate && (
                      <p className="mt-1 text-xs text-slate-500">
                        Ritiro previsto:{" "}
                        {new Date(p.expectedPickupDate + "T12:00:00").toLocaleDateString("it-IT")}
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      )}
    </main>
  );
}
