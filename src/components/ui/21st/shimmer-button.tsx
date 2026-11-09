"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShimmerButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

/**
 * Callers: WebAgencyCaseStudy DemoCta, other CTAs via href.
 * API: optional target/rel on <a> when href is set (external demos).
 * Schema: none. User: "le demo in /web-agency/lavori al clic su apri demo live non portano a nulla"
 */
export function ShimmerButton({
  children,
  className,
  href,
  target,
  rel,
  onClick,
  type = "button",
}: ShimmerButtonProps) {
  const classes = cn(
    "brutal-cta-ink group relative inline-flex overflow-hidden px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white",
    "bg-[var(--ink)] transition hover:bg-[#5E0ED7]",
    className,
  );

  const shimmer = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
    />
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {shimmer}
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {shimmer}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
