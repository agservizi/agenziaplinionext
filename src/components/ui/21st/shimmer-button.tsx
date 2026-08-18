"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShimmerButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function ShimmerButton({
  children,
  className,
  href,
  onClick,
  type = "button",
}: ShimmerButtonProps) {
  const classes = cn(
    "group relative inline-flex overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white",
    "bg-[#5E0ED7] transition hover:bg-[#6d22e8]",
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
      <a href={href} className={classes}>
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
