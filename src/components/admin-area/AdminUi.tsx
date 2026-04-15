"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function adminStatusTone(status: string) {
  const normalized = String(status || "").toLowerCase();

  if (["completed", "evasa", "chiusa", "paid", "sent", "ready"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (
    ["processing", "in_lavorazione", "qualificata", "offerta", "brief_ricevuto", "confirmed_by_brt", "submitted_to_brt"].includes(
      normalized,
    )
  ) {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }
  if (
    ["awaiting_review", "waiting-documents", "in_attesa_cliente", "pending_payment", "pending", "missing"].includes(
      normalized,
    )
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (["cancelled", "failed", "error"].includes(normalized)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function AdminStatusBadge({
  label,
  value,
  className = "",
}: {
  label?: string;
  value: string;
  className?: string;
}) {
  return (
    <Badge
      className={`text-[11px] uppercase tracking-[0.16em] ${adminStatusTone(value)} ${className}`.trim()}
    >
      {label ? `${label}: ${value}` : value}
    </Badge>
  );
}

export function AdminMetricCard({
  eyebrow,
  value,
  description,
}: {
  eyebrow: string;
  value: ReactNode;
  description?: string;
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">{eyebrow}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      </CardContent>
    </Card>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-xl border-dashed">
      <CardContent className="px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">{title}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
