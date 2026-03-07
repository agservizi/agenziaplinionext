"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CAF_PATRONATO_CATALOG,
  getCafPatronatoService,
} from "@/lib/caf-patronato-catalog";
import {
  deleteAdminCafPatronatoPricing,
  fetchAdminCafPatronatoPricing,
  getAdminPortalToken,
  upsertAdminCafPatronatoPricing,
  type CafPatronatoPricingRule,
} from "@/lib/admin-portal-auth";

type PricingFormState = {
  id?: number;
  serviceType: string;
  label: string;
  priceEUR: string;
  sortOrder: string;
  active: boolean;
};

const SERVICE_OPTIONS = CAF_PATRONATO_CATALOG.flatMap((category) =>
  category.services.map((service) => ({
    value: service.value,
    label: service.label,
    categoryTitle: category.title,
    scope: category.scope,
    defaultPriceEUR: service.priceEUR,
  })),
);

function buildInitialFormState(): PricingFormState {
  const first = SERVICE_OPTIONS[0];
  return {
    serviceType: first?.value || "",
    label: first?.label ? `${first.label} pubblico` : "",
    priceEUR: String(first?.defaultPriceEUR ?? 0),
    sortOrder: "10",
    active: true,
  };
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function AdminCafPatronatoPricingManager() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [rules, setRules] = useState<CafPatronatoPricingRule[]>([]);
  const [form, setForm] = useState<PricingFormState>(() => buildInitialFormState());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = await fetchAdminCafPatronatoPricing(token);
        if (!active) return;
        setRules(payload);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Errore caricamento listino CAF e Patronato",
        );
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  const rulesByService = useMemo(
    () =>
      SERVICE_OPTIONS.map((service) => ({
        ...service,
        rules: rules.filter((rule) => rule.serviceType === service.value),
      })),
    [rules],
  );

  const resetForm = () => {
    setForm(buildInitialFormState());
  };

  const reloadRules = async () => {
    const token = getAdminPortalToken();
    const payload = await fetchAdminCafPatronatoPricing(token);
    setRules(payload);
  };

  const onServiceChange = (serviceType: string) => {
    const service = SERVICE_OPTIONS.find((item) => item.value === serviceType);
    setForm((current) => ({
      ...current,
      serviceType,
      label: current.id ? current.label : service ? `${service.label} pubblico` : current.label,
      priceEUR: current.id ? current.priceEUR : String(service?.defaultPriceEUR ?? 0),
    }));
  };

  const onEdit = (rule: CafPatronatoPricingRule) => {
    setForm({
      id: rule.id,
      serviceType: rule.serviceType,
      label: rule.label,
      priceEUR: String(rule.priceEUR),
      sortOrder: String(rule.sortOrder),
      active: rule.active,
    });
    setMessage(`Sto modificando la regola CAF/Patronato #${rule.id}.`);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const resultMessage = await upsertAdminCafPatronatoPricing(token, {
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
      setMessage(
        error instanceof Error ? error.message : "Errore salvataggio listino CAF e Patronato",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const token = getAdminPortalToken();
      const resultMessage = await deleteAdminCafPatronatoPricing(token, id);
      await reloadRules();
      if (form.id === id) {
        resetForm();
      }
      setMessage(resultMessage);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Errore rimozione regola CAF e Patronato",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-600">Sto caricando il listino CAF e Patronato...</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Listino non disponibile
        </p>
        <p className="mt-3 text-base font-medium text-red-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Listino CAF e Patronato
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Qui imposto il prezzo pubblico di ogni pratica.
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Appena salvo una regola, il checkout Stripe, lo storico cliente e le mail finali usano
          questo importo al posto del prezzo base del catalogo.
        </p>
        {message ? <p className="mt-4 text-sm font-medium text-cyan-700">{message}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Regola {form.id ? `#${form.id}` : "nuova"}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Servizio
              </span>
              <select
                value={form.serviceType}
                onChange={(event) => onServiceChange(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              >
                {CAF_PATRONATO_CATALOG.map((category) => (
                  <optgroup
                    key={category.id}
                    label={`${category.scope === "caf" ? "CAF" : "Patronato"} · ${category.title}`}
                  >
                    {category.services.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Etichetta
              </span>
              <input
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="730 pubblico"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Prezzo euro
              </span>
              <input
                type="number"
                step="0.01"
                value={form.priceEUR}
                onChange={(event) => setForm((current) => ({ ...current, priceEUR: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Ordine
              </span>
              <input
                type="number"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Regola attiva e visibile al cliente</span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !form.label.trim() || !form.serviceType}
              className="rounded-full border border-cyan-200 bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Sto salvando..." : form.id ? "Aggiorna regola" : "Salva regola"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Nuova regola
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <p className="text-sm text-slate-600">
                Non ho ancora regole salvate. Finché il listino è vuoto, il sistema usa i prezzi
                base del catalogo CAF/Patronato.
              </p>
            </div>
          ) : (
            rulesByService
              .filter((group) => group.rules.length > 0)
              .map((group) => {
                const service = getCafPatronatoService(group.value);
                return (
                  <div
                    key={group.value}
                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      {group.scope === "caf" ? "CAF" : "Patronato"} · {group.categoryTitle}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {group.label}
                      {service ? (
                        <span className="ml-2 text-sm font-medium text-slate-500">
                          base {formatDecimal(service.priceEUR)} €
                        </span>
                      ) : null}
                    </p>

                    <div className="mt-4 space-y-3">
                      {group.rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{rule.label}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                {formatDecimal(rule.priceEUR)} € • ordine {rule.sortOrder}
                              </p>
                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                {rule.active ? "attiva" : "disattivata"}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => onEdit(rule)}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                Modifica
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(rule.id)}
                                disabled={deletingId === rule.id}
                                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === rule.id ? "Rimuovo..." : "Elimina"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
