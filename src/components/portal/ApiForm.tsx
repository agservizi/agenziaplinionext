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
      className={`space-y-3 rounded-xl border p-4 ${
        isClient ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      {fields.map((field) => (
        <label key={field.name} className="block text-sm">
          <span className={isClient ? "text-white/60" : "text-slate-600"}>{field.label}</span>
          <input
            type={field.type || "text"}
            required={field.required}
            placeholder={field.placeholder}
            value={values[field.name] || ""}
            onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 ${
              isClient
                ? "border-white/10 bg-black/30 text-white"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#5E0ED7] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50"
      >
        {loading ? "Attendi…" : submitLabel}
      </button>
      {message ? (
        <p className={`text-sm ${isClient ? "text-emerald-300" : "text-emerald-700"}`}>{message}</p>
      ) : null}
      {error ? (
        <p className={`text-sm ${isClient ? "text-rose-300" : "text-rose-700"}`}>{error}</p>
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
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
          tone === "client"
            ? "border-white/20 text-white hover:bg-white/10"
            : "border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {loading ? "…" : label}
      </button>
      {msg ? <span className="text-[11px] text-amber-600">{msg}</span> : null}
    </div>
  );
}
