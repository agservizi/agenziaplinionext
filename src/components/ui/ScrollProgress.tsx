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
        className="fixed top-0 left-0 z-9999 h-[2px] origin-left"
        style={{ backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee)" }}
        style={{ scaleX: scrollYProgress, width: "100%" }}
      />
    </>
  );
}
