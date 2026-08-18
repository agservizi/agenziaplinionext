"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ScaleCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScaleCard({ children, className = "", delay = 0 }: ScaleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
      animate={isInView || reduced ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
