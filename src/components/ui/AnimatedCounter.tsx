"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useInView, animate } from "framer-motion";

function parseValue(value: string | number): {
  from: number;
  to: number;
  prefix: string;
  suffix: string;
} | null {
  const str = String(value).trim();
  const match = str.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (!match) return null;
  const num = parseInt(match[2], 10);
  const from = num > 1000 ? num - 12 : num > 100 ? num - 8 : 0;
  return { from, to: num, prefix: match[1] || "", suffix: match[3] || "" };
}

export default function AnimatedCounter({ value }: { value: string | number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parseValue(value);
  const motionValue = useMotionValue(parsed?.from ?? 0);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || !parsed) return;
    if (ref.current) {
      ref.current.textContent = parsed.prefix + parsed.from + parsed.suffix;
    }
    motionValue.set(parsed.from);
    const controls = animate(motionValue, parsed.to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = parsed.prefix + Math.round(latest) + parsed.suffix;
        }
      },
    });
    return controls.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  if (!parsed) {
    return <>{value}</>;
  }

  return (
    <span ref={ref}>
      {parsed.prefix}
      {parsed.to}
      {parsed.suffix}
    </span>
  );
}
