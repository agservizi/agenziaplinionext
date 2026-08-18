"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardSpotlightProps = {
  children: ReactNode;
  className?: string;
};

export function CardSpotlight({ children, className }: CardSpotlightProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6",
        "transition duration-500 hover:border-cyan-400/30 hover:bg-white/[0.07]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(34,211,238,0.12), transparent 40%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
