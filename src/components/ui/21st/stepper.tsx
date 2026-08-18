"use client";

import { cn } from "@/lib/utils";

type StepperProps = {
  steps: string[];
  current: number;
  className?: string;
};

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-2", className)}>
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                done && "bg-emerald-500/20 text-emerald-300",
                active && "bg-cyan-500 text-slate-950",
                !done && !active && "bg-white/10 text-slate-400",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                active ? "text-white" : "text-slate-500",
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 ? (
              <span className="mx-1 hidden h-px w-6 bg-white/15 sm:inline-block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
