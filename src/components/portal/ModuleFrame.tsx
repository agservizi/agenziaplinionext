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
    <div className={isClient ? "bg-[var(--paper)] text-[var(--ink)]" : "space-y-6 p-6 text-slate-900 md:p-8"}>
      <div
        className={`flex flex-wrap items-end justify-between gap-4 ${
          isClient
            ? "border-b border-[var(--ink)]/10 px-5 py-8 md:px-8"
            : "border-b border-[var(--ink)]/10 pb-6"
        }`}
      >
        <div>
          {eyebrow ? (
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.28em] ${
                isClient ? "text-[var(--ink)]/40" : "text-cyan-700"
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`mt-2 ${
              isClient
                ? "display-type text-[clamp(1.5rem,3vw,2.25rem)]"
                : "text-2xl font-bold text-slate-900"
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`mt-2 max-w-2xl text-sm leading-relaxed ${
                isClient ? "text-[var(--ink)]/55" : "text-slate-600"
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className={isClient ? "space-y-6 px-5 py-6 md:px-8" : undefined}>{children}</div>
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
        ? "border-amber-700/25 bg-amber-50 text-amber-900"
        : "border-amber-200 bg-amber-50 text-amber-900"
      : variant === "error"
        ? isClient
          ? "border-rose-700/25 bg-rose-50 text-rose-900"
          : "border-rose-200 bg-rose-50 text-rose-900"
        : isClient
          ? "border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] text-[var(--ink)]/55"
          : "border-slate-200 bg-white text-slate-500";

  const isEmpty = variant === "empty" && isClient;

  return (
    <div className={`border p-6 text-sm ${styles}`}>
      {isEmpty ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/35">Vuoto</p>
      ) : null}
      <div className={isEmpty ? "mt-3" : undefined}>{children}</div>
    </div>
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
      className={`overflow-x-auto border ${
        isClient
          ? "border-[var(--ink)]/12 bg-[var(--paper)]"
          : "rounded-xl border-slate-200 bg-white"
      }`}
    >
      <table className="min-w-full text-left text-sm">
        <thead
          className={`border-b text-[10px] font-bold uppercase tracking-[0.18em] ${
            isClient
              ? "border-[var(--ink)]/10 text-[var(--ink)]/45"
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
                isClient ? "border-[var(--ink)]/8" : "border-slate-50"
              }`}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-[var(--ink)]">
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
