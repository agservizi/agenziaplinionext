/**
 * Callers: /fermo-deposito/i-miei-pacchi page.
 * API: GET /api/locker-point/packages?email|phone|code=
 * User: "/deposito-bagagli/i-miei-depositi e /fermo-deposito/i-miei-pacchi non sono in brutal editorial"
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

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

const INPUT_CLASS =
  "w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]";

const CTA_CLASS =
  "brutal-cta-ink inline-flex w-full items-center justify-center bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:cursor-not-allowed disabled:opacity-60";

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
      const raw = await res.text();
      let json: Record<string, unknown> = {};
      try {
        json = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      } catch {
        throw new Error(raw.slice(0, 140) || "Impossibile recuperare i pacchi.");
      }

      if (!res.ok || json.success === false) {
        const err = json.error as { message?: string } | undefined;
        throw new Error(err?.message ?? "Impossibile recuperare i pacchi.");
      }

      const wrapper = (json.data ?? json) as Record<string, unknown>;
      const list = Array.isArray(wrapper)
        ? wrapper
        : ((wrapper.packages ?? wrapper.items ?? wrapper.results ?? []) as Record<
            string,
            unknown
          >[]);

      if (mode === "code" && list.length === 0 && wrapper.code) {
        window.location.href = `/fermo-deposito/pacco/${encodeURIComponent(String(wrapper.code))}`;
        return;
      }

      const mapped: PackageSummary[] = list.map((p) => ({
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
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40"
        >
          Fermo deposito
        </motion.p>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: EASE, duration: 0.55 }}
          className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]"
        >
          I miei pacchi
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Cerca per email, telefono o codice LP e vedi stato e ritiro previsto.
        </p>
        <Link
          href="/fermo-deposito"
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7] hover:underline"
        >
          Nuova prenotazione
        </Link>
      </section>

      <section className="px-5 py-8 md:px-8">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              mode === "email"
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--ink)]/15 text-[var(--ink)]/55 hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            }`}
          >
            Email / telefono
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              mode === "code"
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--ink)]/15 text-[var(--ink)]/55 hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            }`}
          >
            Codice LP
          </button>
        </div>

        <form onSubmit={fetchPackages} className="max-w-xl space-y-3">
          {mode === "code" ? (
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Codice pacco
              </span>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={INPUT_CLASS}
                placeholder="LP-XXXXXX"
                aria-label="Codice pacco"
              />
            </label>
          ) : (
            <>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="tua@email.it"
                  aria-label="Email"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                  Telefono
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Opzionale"
                  aria-label="Telefono"
                />
              </label>
            </>
          )}
          <button type="submit" disabled={fetchState === "loading"} className={CTA_CLASS}>
            {fetchState === "loading" ? "Ricerca..." : "Cerca"}
          </button>
        </form>

        {errorMsg ? (
          <p role="alert" className="mt-5 text-sm font-medium text-red-600">
            {errorMsg}
          </p>
        ) : null}

        {fetchState === "done" ? (
          <div className="mt-8">
            {packages.length === 0 ? (
              <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 text-sm text-[var(--ink)]/55">
                Nessun pacco trovato.
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
                    Risultati
                  </p>
                  <span className="border border-[var(--ink)]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
                    {packages.length} pacchi
                  </span>
                </div>
                <div className="border border-[var(--ink)]/12">
                  {packages.map((p, i) => (
                    <motion.div
                      key={p.code}
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                      className="border-t border-[var(--ink)]/10 first:border-t-0"
                    >
                      <Link
                        href={`/fermo-deposito/pacco/${encodeURIComponent(p.code)}`}
                        className="block px-4 py-4 transition hover:bg-[color-mix(in_srgb,var(--paper)_90%,white)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-base font-semibold text-[var(--ink)]">
                            {p.code}
                          </span>
                          <span className="border border-[var(--ink)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/60">
                            {p.statusLabel}
                          </span>
                        </div>
                        {p.recipientName ? (
                          <p className="mt-2 text-sm text-[var(--ink)]/55">{p.recipientName}</p>
                        ) : null}
                        {p.expectedPickupDate ? (
                          <p className="mt-1 text-xs text-[var(--ink)]/45">
                            Ritiro previsto:{" "}
                            {new Date(p.expectedPickupDate + "T12:00:00").toLocaleDateString(
                              "it-IT",
                            )}
                          </p>
                        ) : null}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
