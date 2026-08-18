"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextShimmerProps = {
  children: ReactNode;
  className?: string;
};

export function TextShimmer({ children, className }: TextShimmerProps) {
  return (
    <span
      className={cn(
        "bg-linear-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent",
        "animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]",
        className,
      )}
    >
      {children}
    </span>
  );
}
