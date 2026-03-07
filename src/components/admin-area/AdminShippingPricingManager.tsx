"use client";

import { useEffect, useState } from "react";
import {
  deleteAdminShippingPricing,
  fetchAdminShippingPricing,
  getAdminPortalToken,
  upsertAdminShippingPricing,
  type ShippingPricingRule,
} from "@/lib/admin-portal-auth";

type PricingFormState = {
  id?: number;
  label: string;
  minWeightKG: string;
  maxWeightKG: string;
  minVolumeM3: string;
  maxVolumeM3: string;
  priceEUR: string;
  sortOrder: string;
  active: boolean;
};

function buildInitialFormState(): PricingFormState {
  return {
    label: "",
    minWeightKG: "0",
    maxWeightKG: "3",
    minVolumeM3: "0",
    maxVolumeM3: "0.015",
    priceEUR: "7.90",
    sortOrder: "10",
    active: true,
  };
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function AdminShippingPricingManager() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [rules, setRules] = useState<ShippingPricingRule[]>([]);
  const [form, setForm] = useState<PricingFormState>(() => buildInitialFormState());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminShippingPricing(token);
        if (!active) return;
        setRules(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento listino");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setForm(buildInitialFormState());
  };

  const reloadRules = async () => {
    const token = getAdminPortalToken();
    const payload = await fetchAdminShippingPricing(token);
    setRules(payload);
  };

  const onEdit = (rule: ShippingPricingRule) => {
    setForm({
      id: rule.id,
      label: rule.label,
      minWeightKG: String(rule.minWeightKG),
      maxWeightKG: String(rule.maxWeightKG),
      minVolumeM3: String(rule.minVolumeM3),
      maxVolumeM3: String(rule.maxVolumeM3),
      priceEUR: String(rule.priceEUR),
      sortOrder: String(rule.sortOrder),
      active: rule.active,
    });
    setMessage(`Sto modificando la regola #${rule.id}.`);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const resultMessage = await upsertAdminShippingPricing(token, {
        id: form.id,
        label: form.label.trim(),
        minWeightKG: Number(form.minWeightKG) || 0,
        maxWeightKG: Number(form.maxWeightKG) || 0,
        minVolumeM3: Number(form.minVolumeM3) || 0,
        maxVolumeM3: Number(form.maxVolumeM3) || 0,
        priceEUR: Number(form.priceEUR) || 0,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      });
      await reloadRules();
      setMessage(resultMessage);
      resetForm();
      setStatus("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore salvataggio listino");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const resultMessage = await deleteAdminShippingPricing(token, id);
      await reloadRules();
      if (form.id === id) {
        resetForm();
      }
      setMessage(resultMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore rimozione regola");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-300">Sto caricando il listino spedizioni...</p>;
  }

  if (status === "error") {
    return (
      <div className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
          Listino non disponibile
        </p>
        <p className="mt-3 text-base font-medium text-red-200">{message}</p>
        <p className="mt-3 text-sm text-slate-300">
          Qui il pannello c&apos;&egrave;, ma il backend locale non sta ancora esponendo le route del
          listino. Di solito basta riavviare `npm run dev:backend` oppure `npm run dev:full`.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Listino Spedizioni
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Qui definisco gli scaglioni reali per peso e volume.
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Quando salvo una regola, il costo live in area clienti usa questo listino prima della stima
          generica.
        </p>
        {message ? <p className="mt-4 text-sm font-medium text-cyan-200">{message}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-4xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Regola {form.id ? `#${form.id}` : "nuova"}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Etichetta
              </span>
              <input
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Italia 0-3 kg / volume base"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Peso minimo kg
              </span>
              <input
                type="number"
                step="0.01"
                value={form.minWeightKG}
                onChange={(event) =>
                  setForm((current) => ({ ...current, minWeightKG: event.target.value }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Peso massimo kg
              </span>
              <input
                type="number"
                step="0.01"
                value={form.maxWeightKG}
                onChange={(event) =>
                  setForm((current) => ({ ...current, maxWeightKG: event.target.value }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Volume minimo m3
              </span>
              <input
                type="number"
                step="0.0001"
                value={form.minVolumeM3}
                onChange={(event) =>
                  setForm((current) => ({ ...current, minVolumeM3: event.target.value }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Volume massimo m3
              </span>
              <input
                type="number"
                step="0.0001"
                value={form.maxVolumeM3}
                onChange={(event) =>
                  setForm((current) => ({ ...current, maxVolumeM3: event.target.value }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Prezzo euro
              </span>
              <input
                type="number"
                step="0.01"
                value={form.priceEUR}
                onChange={(event) => setForm((current) => ({ ...current, priceEUR: event.target.value }))}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Ordine
              </span>
              <input
                type="number"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 rounded border-white/20 bg-slate-900/60"
              />
              <span className="text-sm text-slate-200">Regola attiva e utilizzabile in area clienti</span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !form.label.trim()}
              className="rounded-full border border-cyan-400/30 bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Sto salvando..." : form.id ? "Aggiorna regola" : "Salva regola"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-white/10 bg-slate-900/60 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Nuova regola
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="glass-card rounded-4xl p-6">
              <p className="text-sm text-slate-300">
                Non ho ancora uno scaglione salvato. Appena ne creo uno, il costo live del cliente
                diventa coerente con il listino.
              </p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="glass-card rounded-4xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                      Regola #{rule.id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{rule.label}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Peso {rule.minWeightKG} - {rule.maxWeightKG} kg • Volume {rule.minVolumeM3} -{" "}
                      {rule.maxVolumeM3} m3
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Prezzo <strong className="text-white">{formatDecimal(rule.priceEUR)} euro</strong>
                      {" • "}ordine {rule.sortOrder}
                      {" • "}
                      {rule.active ? "attiva" : "disattiva"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(rule)}
                      className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                    >
                      Modifica
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(rule.id)}
                      disabled={deletingId === rule.id}
                      className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === rule.id ? "Rimuovo..." : "Elimina"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
