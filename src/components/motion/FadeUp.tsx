"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type FadeUpProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
};

export function FadeUp({
  children,
  delay = 0,
  className = "",
  amount = 0.1,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      animate={isInView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
