"use client";

import { useRef } from "react";
import { useScroll, motion } from "framer-motion";

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  return (
    <>
      <div ref={ref} className="pointer-events-none fixed inset-0 z-[-1]" aria-hidden="true" />
      <motion.div
        className="fixed top-0 left-0 z-9999 h-0.5 origin-left bg-linear-to-r from-cyan-400 via-cyan-300 to-teal-400"
        style={{ scaleX: scrollYProgress, width: "100%" }}
      />
    </>
  );
}
