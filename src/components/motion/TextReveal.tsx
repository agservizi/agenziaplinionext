"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function TextReveal({ children, className = "", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className={`overflow-hidden pb-4 ${className}`}>
      <motion.div
        initial={reduced ? false : { y: "110%" }}
        animate={isInView || reduced ? { y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
