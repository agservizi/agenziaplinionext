"use client";

import { useEffect, useState } from "react";
import { AdminEmptyState, AdminMetricCard } from "@/components/admin-area/AdminUi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  carrierProvider: "brt" | "inpost";
  packageSize: "" | "small" | "medium" | "large";
  serviceScope: "national" | "international" | "all";
  countryCode: string;
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
    carrierProvider: "brt",
    packageSize: "",
    serviceScope: "national",
    countryCode: "IT",
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

function inpostPackageLabel(value: string) {
  if (value === "small") return "Piccolo (S)";
  if (value === "medium") return "Medio (M)";
  if (value === "large") return "Grande (L)";
  return "-";
}

const EUROPE_COUNTRY_OPTIONS = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GB",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "BA",
  "RS",
];

function scopeLabel(scope: ShippingPricingRule["serviceScope"]) {
  if (scope === "national") return "Nazionale";
  if (scope === "international") return "Internazionale";
  return "Generica";
}

function normalizeScope(scope: string | undefined): ShippingPricingRule["serviceScope"] {
  const normalized = String(scope || "").trim().toLowerCase();
  if (normalized === "national" || normalized === "international" || normalized === "all") {
    return normalized;
  }
  return "all";
}

function normalizeRules(payload: ShippingPricingRule[]): ShippingPricingRule[] {
  return payload.map((rule) => ({
    ...rule,
    carrierProvider: (rule.carrierProvider === "inpost" ? "inpost" : "brt") as "brt" | "inpost",
    packageSize:
      rule.packageSize === "small" || rule.packageSize === "medium" || rule.packageSize === "large"
        ? rule.packageSize
        : "",
    serviceScope: normalizeScope(rule.serviceScope),
    countryCode: String(rule.countryCode || "").trim().toUpperCase(),
  }));
}

export default function AdminShippingPricingManager() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [rules, setRules] = useState<ShippingPricingRule[]>([]);
  const [form, setForm] = useState<PricingFormState>(() => buildInitialFormState());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [carrierTab, setCarrierTab] = useState<"brt" | "inpost">("brt");
  const [activeTab, setActiveTab] = useState<"national" | "international" | "all">("national");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const token = getAdminPortalToken();
        const payload = normalizeRules(await fetchAdminShippingPricing(token));
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

  useEffect(() => {
    if (carrierTab === "inpost" && activeTab !== "national") {
      setActiveTab("national");
    }
  }, [activeTab, carrierTab]);

  const resetForm = () => {
    setForm(buildInitialFormState());
  };

  const reloadRules = async () => {
    const token = getAdminPortalToken();
    const payload = normalizeRules(await fetchAdminShippingPricing(token));
    setRules(payload);
  };

  const onEdit = (rule: ShippingPricingRule) => {
    setForm({
      id: rule.id,
      label: rule.label,
      carrierProvider: rule.carrierProvider === "inpost" ? "inpost" : "brt",
      packageSize:
        rule.packageSize === "small" || rule.packageSize === "medium" || rule.packageSize === "large"
          ? rule.packageSize
          : "",
      serviceScope: normalizeScope(rule.serviceScope),
      countryCode: rule.countryCode || "",
      minWeightKG: rule.carrierProvider === "inpost" ? "0" : String(rule.minWeightKG),
      maxWeightKG: rule.carrierProvider === "inpost" ? "25" : String(rule.maxWeightKG),
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
        carrierProvider: form.carrierProvider,
        packageSize: form.carrierProvider === "inpost" ? form.packageSize : "",
        serviceScope: form.carrierProvider === "inpost" ? "national" : form.serviceScope,
        countryCode:
          form.carrierProvider === "inpost"
            ? "IT"
            : form.serviceScope === "national"
            ? "IT"
            : form.serviceScope === "international"
              ? (form.countryCode || "ALL")
              : "",
        minWeightKG: form.carrierProvider === "inpost" ? 0 : Number(form.minWeightKG) || 0,
        maxWeightKG: form.carrierProvider === "inpost" ? 25 : Number(form.maxWeightKG) || 0,
        minVolumeM3: form.carrierProvider === "inpost" ? 0 : Number(form.minVolumeM3) || 0,
        maxVolumeM3: form.carrierProvider === "inpost" ? 0 : Number(form.maxVolumeM3) || 0,
        priceEUR: Number(form.priceEUR) || 0,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      });
      await reloadRules();
      setMessage(resultMessage);
      setCarrierTab(form.carrierProvider);
      if (form.serviceScope === "national" || form.serviceScope === "international") {
        setActiveTab(form.serviceScope);
      }
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
    return <p className="text-sm text-slate-500">Sto caricando il listino spedizioni...</p>;
  }

  if (status === "error") {
    return (
      <Card className="rounded-2xl border-red-200">
        <CardContent className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Listino non disponibile
        </p>
        <p className="mt-3 text-base font-medium text-red-700">{message}</p>
        <p className="mt-3 text-sm text-slate-600">
          Qui il pannello c&apos;&egrave;, ma il backend locale non sta ancora esponendo le route del
          listino. Di solito basta riavviare `npm run dev:backend` oppure `npm run dev:full`.
        </p>
        </CardContent>
      </Card>
    );
  }

  const filteredRules = rules.filter((rule) => {
    if (rule.carrierProvider !== carrierTab) return false;
    if (activeTab === "all") return true;
    return normalizeScope(rule.serviceScope) === activeTab;
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Listino Spedizioni
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Qui definisco listini separati per BRT e InPost.
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Ogni regola appartiene a un corriere preciso e a un ambito: nazionale o internazionale.
          BRT legge solo il proprio listino, mentre InPost usa un listino dedicato separato.
        </p>
        {message ? <p className="mt-4 text-sm font-medium text-cyan-700">{message}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard eyebrow="Regole totali" value={rules.length} description="Intero listino spedizioni" />
        <AdminMetricCard eyebrow="Regole nel tab" value={filteredRules.length} description="Voci nel focus corrente" />
        <AdminMetricCard eyebrow="Attive" value={rules.filter((rule) => rule.active).length} description="Usate in area clienti" />
      </div>

      <div className="admin-adaptive-split-grid grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-4xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Regola {form.id ? `#${form.id}` : "nuova"}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Etichetta
              </span>
              <Input
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="Italia 0-3 kg / volume base"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Corriere
              </span>
              <select
                value={form.carrierProvider}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    carrierProvider: event.target.value === "inpost" ? "inpost" : "brt",
                    packageSize:
                      event.target.value === "inpost"
                        ? current.packageSize || "small"
                        : "",
                    minWeightKG: event.target.value === "inpost" ? "0" : current.minWeightKG,
                    maxWeightKG: event.target.value === "inpost" ? "25" : current.maxWeightKG,
                    minVolumeM3: event.target.value === "inpost" ? "0" : current.minVolumeM3,
                    maxVolumeM3: event.target.value === "inpost" ? "0" : current.maxVolumeM3,
                    serviceScope:
                      event.target.value === "inpost"
                        ? "national"
                        : current.serviceScope,
                    countryCode:
                      event.target.value === "inpost" ? "IT" : current.countryCode,
                  }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="brt">BRT</option>
                <option value="inpost">InPost</option>
              </select>
            </label>

            {form.carrierProvider === "inpost" ? (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Taglia InPost
                </span>
                <select
                  value={form.packageSize}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      packageSize: event.target.value as PricingFormState["packageSize"],
                    }))
                  }
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="small">Piccolo (S)</option>
                  <option value="medium">Medio (M)</option>
                  <option value="large">Grande (L)</option>
                </select>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Ambito
              </span>
              <select
                value={form.serviceScope}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    serviceScope:
                      current.carrierProvider === "inpost" &&
                      event.target.value === "international"
                        ? "national"
                        : (event.target.value as PricingFormState["serviceScope"]),
                    countryCode:
                      current.carrierProvider === "inpost"
                        ? "IT"
                        : event.target.value === "national"
                        ? "IT"
                        : event.target.value === "international"
                          ? (current.countryCode && current.countryCode !== "IT"
                              ? current.countryCode
                              : "ALL")
                          : "",
                  }))
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="national">Nazionale</option>
                <option value="international" disabled={form.carrierProvider === "inpost"}>
                  Internazionale
                </option>
                <option value="all" disabled={form.carrierProvider === "inpost"}>
                  Generica (legacy)
                </option>
              </select>
              {form.carrierProvider === "inpost" ? (
                <span className="mt-2 block text-xs text-cyan-300">
                  InPost e vincolato a regole nazionali Italia e a tre taglie dedicate: S, M, L.
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Nazione
              </span>
              <select
                value={
                  form.carrierProvider === "inpost"
                    ? "IT"
                    : form.serviceScope === "national"
                    ? "IT"
                    : form.serviceScope === "international"
                      ? (form.countryCode || "ALL")
                      : ""
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    countryCode: event.target.value,
                  }))
                }
                disabled={
                  form.carrierProvider === "inpost" ||
                  form.serviceScope === "national" ||
                  form.serviceScope === "all"
                }
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
              >
                {form.serviceScope === "international" ? <option value="ALL">Tutte le nazioni (fallback)</option> : null}
                {EUROPE_COUNTRY_OPTIONS.map((countryCode) => (
                  <option key={countryCode} value={countryCode}>
                    {countryCode}
                  </option>
                ))}
              </select>
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
                disabled={form.carrierProvider === "inpost"}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
              />
              {form.carrierProvider === "inpost" ? (
                <span className="mt-2 block text-xs text-slate-400">Per InPost il limite operativo e gestito a 25 kg.</span>
              ) : null}
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
                disabled={form.carrierProvider === "inpost"}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
              />
              {form.carrierProvider === "inpost" ? (
                <span className="mt-2 block text-xs text-slate-400">Per tutte le taglie InPost il peso massimo resta 25 kg.</span>
              ) : null}
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
                disabled={form.carrierProvider === "inpost"}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
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
                disabled={form.carrierProvider === "inpost"}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
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
            <Button
              type="button"
              onClick={onSave}
              disabled={saving || !form.label.trim()}
              variant="secondary"
              className="rounded-full"
            >
              {saving ? "Sto salvando..." : form.id ? "Aggiorna regola" : "Salva regola"}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="rounded-full"
            >
              Nuova regola
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-4xl p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setCarrierTab("brt")}
                variant={carrierTab === "brt" ? "secondary" : "outline"}
                className="rounded-full"
              >
                BRT
              </Button>
              <Button
                type="button"
                onClick={() => setCarrierTab("inpost")}
                variant={carrierTab === "inpost" ? "secondary" : "outline"}
                className="rounded-full"
              >
                InPost
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("national")}
                variant={activeTab === "national" ? "secondary" : "outline"}
                className="rounded-full"
              >
                Nazionale
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("international")}
                variant={activeTab === "international" ? "secondary" : "outline"}
                disabled={carrierTab === "inpost"}
                className="rounded-full"
              >
                Internazionale
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("all")}
                variant={activeTab === "all" ? "secondary" : "outline"}
                disabled={carrierTab === "inpost"}
                className="rounded-full"
              >
                Tutte
              </Button>
            </div>
          </div>

          {filteredRules.length === 0 ? (
            <AdminEmptyState title="Nessuna regola" description="Nessuna regola nel tab selezionato." />
          ) : (
            <div className="glass-card overflow-hidden rounded-4xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">Etichetta</th>
                      <th className="px-4 py-3 font-semibold">Corriere</th>
                      <th className="px-4 py-3 font-semibold">Taglia</th>
                      <th className="px-4 py-3 font-semibold">Ambito</th>
                      <th className="px-4 py-3 font-semibold">Nazione</th>
                      <th className="px-4 py-3 font-semibold">Peso kg</th>
                      <th className="px-4 py-3 font-semibold">Volume m3</th>
                      <th className="px-4 py-3 font-semibold">Prezzo</th>
                      <th className="px-4 py-3 font-semibold">Ordine</th>
                      <th className="px-4 py-3 font-semibold">Stato</th>
                      <th className="px-4 py-3 font-semibold">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="border-t border-white/10 align-top">
                        <td className="whitespace-nowrap px-4 py-3 text-cyan-300">#{rule.id}</td>
                        <td className="px-4 py-3 font-medium text-white">{rule.label}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {rule.carrierProvider === "inpost" ? "InPost" : "BRT"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {rule.carrierProvider === "inpost" ? inpostPackageLabel(rule.packageSize) : "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{scopeLabel(rule.serviceScope)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {rule.serviceScope === "international"
                            ? rule.countryCode || "ALL"
                            : rule.serviceScope === "national"
                              ? "IT"
                              : "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {rule.carrierProvider === "inpost"
                            ? "Fino a 25 kg"
                            : `${rule.minWeightKG} - ${rule.maxWeightKG}`}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {rule.carrierProvider === "inpost"
                            ? "Gestito dalla taglia"
                            : `${rule.minVolumeM3} - ${rule.maxVolumeM3}`}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                          {formatDecimal(rule.priceEUR)} euro
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{rule.sortOrder}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {rule.active ? (
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                              Attiva
                            </span>
                          ) : (
                            <span className="rounded-full border border-slate-500/40 bg-slate-700/30 px-2 py-1 text-xs font-semibold text-slate-300">
                              Disattiva
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(rule)}
                              className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900"
                            >
                              Modifica
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(rule.id)}
                              disabled={deletingId === rule.id}
                              className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === rule.id ? "Rimuovo..." : "Elimina"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
