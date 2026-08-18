"use client";

import { type ReactNode } from "react";

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** GSAP stagger group index */
  stagger?: number;
};

/**
 * Unified scroll-reveal wrapper: GSAP via data-gsap-reveal (desktop)
 * with Motion fallback handled by child FadeUp where needed.
 */
export function RevealSection({
  children,
  className = "",
  id,
  stagger,
}: RevealSectionProps) {
  return (
    <section
      id={id}
      data-gsap-reveal
      data-gsap-stagger={stagger != null ? String(stagger) : undefined}
      className={className}
    >
      {children}
    </section>
  );
}
