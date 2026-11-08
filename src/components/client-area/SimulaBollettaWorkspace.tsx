"use client";

// Importers: area-clienti/simula-bolletta/page.tsx
// API: POST /api/client-area/gestiio/simula; practices via GestiioPracticeWorkspace
// Schema: RankRow + practice initialValues (notes, service_type, simula_*)
// User: "Implement the plan as specified" — ranking select → prefill pratica

import { FormEvent, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getClientPortalToken } from "@/lib/client-portal-auth";
import GestiioPracticeWorkspace from "@/components/client-area/GestiioPracticeWorkspace";

type RankRow = {
  gestore?: string;
  offerta_nome?: string;
  spesa_annua?: number;
  risparmio?: number;
  commodity?: string;
};

function mapRanking(rows: unknown[]): RankRow[] {
  return rows.map((row) => {
    const r = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
    const spesa =
      typeof r.stima_anno === "number"
        ? r.stima_anno
        : typeof r.spesa_annua === "number"
          ? r.spesa_annua
          : undefined;
    const risparmio =
      typeof r.risparmio_euro === "number"
        ? r.risparmio_euro
        : typeof r.risparmio === "number"
          ? r.risparmio
          : undefined;
    return {
      gestore: String(r.gestore_nome || r.gestore || "Gestore"),
      offerta_nome: String(r.nome || r.offerta_nome || "Offerta"),
      spesa_annua: spesa,
      risparmio,
      commodity: typeof r.commodity === "string" ? r.commodity : undefined,
    };
  });
}

function buildNotes(row: RankRow, commodity: string) {
  const stima =
    typeof row.spesa_annua === "number" ? `${row.spesa_annua.toFixed(0)} €/anno` : "n/d";
  const risparmio =
    typeof row.risparmio === "number" ? `${row.risparmio.toFixed(0)} €` : "n/d";
  return `Simulazione: ${row.gestore || "Gestore"} · ${row.offerta_nome || "Offerta"} · stima ${stima} · risparmio ${risparmio} · commodity ${row.commodity || commodity}`;
}

export default function SimulaBollettaWorkspace() {
  const reduceMotion = useReducedMotion() ?? false;
  const [kwh, setKwh] = useState("");
  const [smc, setSmc] = useState("");
  const [potenza, setPotenza] = useState("3");
  const [spesa, setSpesa] = useState("");
  const [commodity, setCommodity] = useState<"luce" | "gas" | "dual">("luce");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ranking, setRanking] = useState<RankRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selected = selectedIndex != null ? ranking[selectedIndex] : null;

  const practiceInitialValues = useMemo(() => {
    if (!selected) return undefined;
    return {
      service_type: (selected.commodity as string) || commodity,
      notes: buildNotes(selected, commodity),
      simula_gestore: selected.gestore || "",
      simula_offerta: selected.offerta_nome || "",
      simula_spesa_annua:
        typeof selected.spesa_annua === "number" ? String(selected.spesa_annua) : "",
      simula_risparmio:
        typeof selected.risparmio === "number" ? String(selected.risparmio) : "",
    };
  }, [selected, commodity]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setRanking([]);
    setSelectedIndex(null);
    try {
      const token = getClientPortalToken();
      const res = await fetch("/api/client-area/gestiio/simula", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          kwh_anno: kwh ? Number(kwh) : undefined,
          smc_anno: smc ? Number(smc) : undefined,
          potenza_kw: potenza ? Number(potenza) : undefined,
          spesa_annua_attuale: spesa ? Number(spesa) : undefined,
          commodity,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Simulazione non riuscita");
      const rankingRaw = Array.isArray(json.ranking)
        ? json.ranking
        : Array.isArray(json.data?.ranking)
          ? json.data.ranking
          : [];
      setRanking(mapRanking(rankingRaw));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di simulazione");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40"
        >
          Area clienti · Simula bolletta
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]"
        >
          Confronta le offerte luce e gas
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Inserisci i consumi a mano, scegli un&apos;offerta dal ranking e apri la pratica contratti
          energia già precompilata.
        </p>
      </section>

      <section className="grid gap-px bg-[var(--ink)]/10 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 bg-[var(--paper)] p-5 md:p-7">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Commodity
            </span>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value as "luce" | "gas" | "dual")}
              className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
            >
              <option value="luce">Luce</option>
              <option value="gas">Gas</option>
              <option value="dual">Luce e gas</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Consumo luce (kWh/anno)
            </span>
            <input
              type="number"
              min={0}
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
              placeholder="Es. 2700"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Consumo gas (Smc/anno)
            </span>
            <input
              type="number"
              min={0}
              value={smc}
              onChange={(e) => setSmc(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
              placeholder="Es. 1000"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Potenza impegnata (kW)
            </span>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={potenza}
              onChange={(e) => setPotenza(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Spesa annua attuale (€)
            </span>
            <input
              type="number"
              min={0}
              value={spesa}
              onChange={(e) => setSpesa(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm outline-none focus:border-[#5E0ED7]"
              placeholder="Opzionale"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#5E0ED7] disabled:opacity-60"
          >
            {busy ? "Calcolo…" : "Simula"}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>

        <div className="bg-[var(--paper)] p-5 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
            Ranking offerte
          </p>
          {ranking.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink)]/45">
              Inserisci i consumi e avvia la simulazione.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {ranking.slice(0, 8).map((row, index) => {
                const active = selectedIndex === index;
                return (
                  <li key={`${row.gestore}-${row.offerta_nome}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full border px-3 py-3 text-left transition ${
                        active
                          ? "border-[#5E0ED7] bg-[color-mix(in_srgb,#5E0ED7_8%,var(--paper))]"
                          : "border-[var(--ink)]/12 hover:border-[var(--ink)]/30"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.12em]">
                        {row.gestore || "Gestore"} · {row.offerta_nome || "Offerta"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink)]/70">
                        {typeof row.spesa_annua === "number"
                          ? `${row.spesa_annua.toFixed(0)} €/anno`
                          : "Stima n/d"}
                        {typeof row.risparmio === "number"
                          ? ` · risparmio ${row.risparmio.toFixed(0)} €`
                          : ""}
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7]">
                        {active ? "Selezionata" : "Scegli questa offerta"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div className="border-t border-[var(--ink)]/10">
        <GestiioPracticeWorkspace
          serviceSlug="contratti-energia"
          title="Vuoi procedere con un contratto?"
          subtitle={
            selected
              ? `Offerta selezionata: ${selected.gestore} · ${selected.offerta_nome}. Completa i dati e apri la pratica.`
              : "Scegli un’offerta dal ranking (o compila comunque): ti ricontattiamo per POD/PDR e documenti."
          }
          initialValues={practiceInitialValues}
          fields={[
            {
              id: "service_type",
              label: "Tipo utenza",
              placeholder: "Scegli",
              type: "select",
              required: true,
              options: [
                { value: "luce", label: "Solo luce" },
                { value: "gas", label: "Solo gas" },
                { value: "dual", label: "Luce e gas" },
              ],
            },
            {
              id: "gestore_id",
              label: "Gestore",
              placeholder: "Scegli il gestore (se disponibile)",
              type: "select",
              required: false,
              options: [],
            },
            { id: "nome", label: "Nome", placeholder: "Nome", required: true },
            { id: "cognome", label: "Cognome", placeholder: "Cognome", required: true },
            {
              id: "tax_code",
              label: "Codice fiscale",
              placeholder: "CF intestatario",
              required: true,
            },
            {
              id: "supply_address",
              label: "Indirizzo fornitura",
              placeholder: "Via, CAP, città",
              required: true,
            },
            { id: "pod_pdr", label: "POD o PDR", placeholder: "Se lo hai già" },
            {
              id: "phone",
              label: "Recapito",
              placeholder: "Cellulare",
              required: true,
            },
            {
              id: "email",
              label: "Email",
              placeholder: "tua@email.it",
              required: true,
            },
            {
              id: "notes",
              label: "Note / offerta simulata",
              placeholder: "Compilate automaticamente se scegli un’offerta",
            },
          ]}
        />
      </div>
    </div>
  );
}
