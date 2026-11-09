"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

export function ApiForm({
  endpoint,
  method = "POST",
  fields,
  submitLabel,
  buildBody,
  onSuccess,
  tone = "admin",
}: {
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    defaultValue?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  submitLabel: string;
  buildBody?: (values: Record<string, string>) => Record<string, unknown>;
  onSuccess?: (data: unknown) => void;
  tone?: "admin" | "client";
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ""])),
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isClient = tone === "client";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const body = buildBody
        ? buildBody(values)
        : Object.fromEntries(
            Object.entries(values).map(([k, v]) => {
              if (v === "true") return [k, true];
              if (v === "false") return [k, false];
              if (v !== "" && !Number.isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v)) {
                return [k, Number(v)];
              }
              return [k, v];
            }),
          );
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || data.message || `Errore ${res.status}`);
      }
      setMessage("Operazione completata.");
      onSuccess?.(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operazione non riuscita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-3 border p-4 ${
        isClient
          ? "border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)]"
          : "rounded-xl border-slate-200 bg-white"
      }`}
    >
      {fields.map((field) => (
        <label key={field.name} className="block text-sm">
          <span
            className={
              isClient
                ? "text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45"
                : "text-slate-600"
            }
          >
            {field.label}
          </span>
          {field.options && field.options.length > 0 ? (
            <select
              required={field.required}
              value={values[field.name] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              className={`mt-1.5 w-full border px-3 py-2 text-sm outline-none ${
                isClient
                  ? "border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] text-[var(--ink)] focus:border-[#5E0ED7]"
                  : "rounded-lg border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500/40"
              }`}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || "text"}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              className={`mt-1.5 w-full border px-3 py-2 text-sm outline-none ${
                isClient
                  ? "border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] text-[var(--ink)] focus:border-[#5E0ED7]"
                  : "rounded-lg border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500/40"
              }`}
            />
          )}
        </label>
      ))}
      <button
        type="submit"
        disabled={loading}
        className={
          isClient
            ? "brutal-cta-ink bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#5E0ED7] disabled:opacity-50"
            : "rounded-full bg-[#5E0ED7] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50"
        }
      >
        {loading ? "Attendi…" : submitLabel}
      </button>
      {message ? (
        <p className={`text-sm ${isClient ? "text-emerald-800" : "text-emerald-700"}`}>{message}</p>
      ) : null}
      {error ? (
        <p className={`text-sm ${isClient ? "text-rose-800" : "text-rose-700"}`}>{error}</p>
      ) : null}
    </form>
  );
}

export function ActionButton({
  endpoint,
  body,
  label,
  tone = "admin",
  confirm,
}: {
  endpoint: string;
  body: Record<string, unknown>;
  label: string;
  tone?: "admin" | "client";
  confirm?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<ReactNode>(null);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || `Errore ${res.status}`);
      if (data.tempPassword) {
        setMsg(`Password temporanea: ${data.tempPassword}`);
      }
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Errore");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={run}
        className={`border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
          tone === "client"
            ? "border-[var(--ink)]/20 text-[var(--ink)] hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            : "rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {loading ? "…" : label}
      </button>
      {msg ? <span className="text-[11px] text-amber-600">{msg}</span> : null}
    </div>
  );
}
