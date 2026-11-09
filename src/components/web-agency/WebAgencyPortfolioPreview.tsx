"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { PortfolioGallery } from "@/components/ui/21st/portfolio-gallery";
import { getFeaturedProjects } from "@/lib/web-agency-portfolio";

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function WebAgencyPortfolioPreview() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const featured = getFeaturedProjects(5);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-8 md:py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#60B1FF]/15 blur-[110px]" />
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: SPRING_EASE }}
          className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Portfolio
        </motion.p>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, delay: 0.08, ease: SPRING_EASE }}
          className="mx-auto mb-2 max-w-xl text-center text-sm text-slate-500 md:text-base"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Ecco cosa sappiamo costruire: siti, shop e piattaforme pensate per convertire.
        </motion.p>
      </div>

      <PortfolioGallery
        title="Lavori che parlano chiaro."
        archiveButton={{ text: "Vedi tutti i lavori", href: "/web-agency/lavori" }}
        images={featured.map((p) => ({
          src: p.cover,
          alt: p.title,
          title: p.title,
          href: `/web-agency/lavori/${p.slug}`,
        }))}
        className="py-6 md:py-10"
      />
    </section>
  );
}
