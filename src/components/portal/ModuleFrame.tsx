import type { ReactNode } from "react";

type Tone = "admin" | "client";

export function ModuleFrame({
  tone = "admin",
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  tone?: Tone;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const isClient = tone === "client";
  return (
    <div className={`space-y-6 p-6 ${isClient ? "text-white" : "text-slate-900"}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                isClient ? "text-cyan-400/80" : "text-cyan-700"
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1 className={`mt-1 text-2xl font-bold ${isClient ? "text-white" : "text-slate-900"}`}>
            {title}
          </h1>
          {description ? (
            <p className={`mt-2 max-w-2xl text-sm ${isClient ? "text-white/50" : "text-slate-600"}`}>
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function ModuleNotice({
  tone = "admin",
  variant = "neutral",
  children,
}: {
  tone?: Tone;
  variant?: "neutral" | "warning" | "error" | "empty";
  children: ReactNode;
}) {
  const isClient = tone === "client";
  const styles =
    variant === "warning"
      ? isClient
        ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
        : "border-amber-200 bg-amber-50 text-amber-900"
      : variant === "error"
        ? isClient
          ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
          : "border-rose-200 bg-rose-50 text-rose-900"
        : isClient
          ? "border-white/10 bg-white/5 text-white/50"
          : "border-slate-200 bg-white text-slate-500";

  return (
    <div className={`rounded-xl border p-6 text-sm ${styles}`}>{children}</div>
  );
}

export function ModuleTable({
  tone = "admin",
  headers,
  rows,
}: {
  tone?: Tone;
  headers: string[];
  rows: ReactNode[][];
}) {
  const isClient = tone === "client";
  return (
    <div
      className={`overflow-x-auto rounded-xl border ${
        isClient ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      <table className="min-w-full text-left text-sm">
        <thead
          className={`border-b text-xs uppercase tracking-wider ${
            isClient
              ? "border-white/10 text-white/40"
              : "border-slate-100 text-slate-500"
          }`}
        >
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b last:border-0 ${
                isClient ? "border-white/5" : "border-slate-50"
              }`}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
