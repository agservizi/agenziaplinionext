"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminVisurePricing,
  fetchAdminVisurePricing,
  getAdminPortalToken,
  upsertAdminVisurePricing,
  type VisuraPricingRule,
} from "@/lib/admin-portal-auth";

type PricingFormState = {
  id?: number;
  serviceType: string;
  label: string;
  priceEUR: string;
  sortOrder: string;
  active: boolean;
};

const SERVICE_OPTIONS = [
  { value: "visura-camerale", label: "Visura camerale" },
  { value: "visura-catastale", label: "Visura catastale" },
  { value: "visura-pra", label: "Visura PRA" },
  { value: "visura-crif", label: "Visura CRIF" },
  { value: "visura-cr", label: "Visura Centrale Rischi" },
];

function buildInitialFormState(): PricingFormState {
  return {
    serviceType: "visura-camerale",
    label: "",
    priceEUR: "8.90",
    sortOrder: "10",
    active: true,
  };
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function AdminVisurePricingManager() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [rules, setRules] = useState<VisuraPricingRule[]>([]);
  const [form, setForm] = useState<PricingFormState>(() => buildInitialFormState());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminVisurePricing(token);
        if (!active) return;
        setRules(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento listino visure");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const rulesByService = useMemo(() => {
    return SERVICE_OPTIONS.map((service) => ({
      ...service,
      rules: rules.filter((rule) => rule.serviceType === service.value),
    }));
  }, [rules]);

  const resetForm = () => {
    setForm(buildInitialFormState());
  };

  const reloadRules = async () => {
    const token = getAdminPortalToken();
    const payload = await fetchAdminVisurePricing(token);
    setRules(payload);
  };

  const onEdit = (rule: VisuraPricingRule) => {
    setForm({
      id: rule.id,
      serviceType: rule.serviceType,
      label: rule.label,
      priceEUR: String(rule.priceEUR),
      sortOrder: String(rule.sortOrder),
      active: rule.active,
    });
    setMessage(`Sto modificando la regola visura #${rule.id}.`);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const resultMessage = await upsertAdminVisurePricing(token, {
        id: form.id,
        serviceType: form.serviceType,
        label: form.label.trim(),
        priceEUR: Number(form.priceEUR) || 0,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      });
      await reloadRules();
      setMessage(resultMessage);
      resetForm();
      setStatus("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore salvataggio listino visure");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const resultMessage = await deleteAdminVisurePricing(token, id);
      await reloadRules();
      if (form.id === id) {
        resetForm();
      }
      setMessage(resultMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore rimozione regola visura");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-300">Sto caricando il listino visure...</p>;
  }

  if (status === "error") {
    return (
      <div className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
          Listino non disponibile
        </p>
        <p className="mt-3 text-base font-medium text-red-200">{message}</p>
        <p className="mt-3 text-sm text-slate-300">
          Il pannello c&apos;&egrave;, ma il backend locale non sta ancora esponendo le route del
          listino visure. In genere basta riavviare `npm run dev:backend` oppure `npm run dev:full`.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-4xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Listino Visure
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Qui definisco il prezzo reale per ogni tipo di visura.
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Appena salvo una regola, il prezzo mostrato in area clienti e quello usato in Stripe si
          allineano automaticamente.
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
                Tipologia visura
              </span>
              <select
                value={form.serviceType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, serviceType: event.target.value }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              >
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Etichetta
              </span>
              <input
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Visura camerale base"
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
              <span className="text-sm text-slate-200">Regola attiva e visibile al cliente</span>
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
                Non ho ancora un prezzo visura salvato. Appena ne creo uno, il costo live del
                cliente diventa coerente con il listino.
              </p>
            </div>
          ) : (
            rulesByService.map((group) => (
              <div key={group.value} className="glass-card rounded-4xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  {group.label}
                </p>
                {group.rules.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-300">Nessuna regola salvata per questa voce.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {group.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="rounded-3xl border border-white/10 bg-slate-950/50 p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{rule.label}</p>
                            <p className="mt-1 text-sm text-slate-300">
                              {formatDecimal(rule.priceEUR)} euro • ordine {rule.sortOrder}
                            </p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                              {rule.active ? "attiva" : "disattivata"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(rule)}
                              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                            >
                              Modifica
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(rule.id)}
                              disabled={deletingId === rule.id}
                              className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === rule.id ? "Rimuovo..." : "Elimina"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

