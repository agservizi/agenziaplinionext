"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type NumberTickerProps = {
  value: number;
  prefix?: string;
  className?: string;
  durationMs?: number;
  delayMs?: number;
};

export function NumberTicker({
  value,
  prefix = "+",
  className,
  durationMs = 1800,
  delayMs = 0,
}: NumberTickerProps) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setCount(value);
      return;
    }
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [value, durationMs, delayMs, reduced]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {count}
    </span>
  );
}
