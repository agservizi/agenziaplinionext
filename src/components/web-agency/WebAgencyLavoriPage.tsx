"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";
import { ProjectShowcase } from "@/components/ui/21st/project-showcase";
import { ShimmerButton } from "@/components/ui/21st/shimmer-button";
import {
  getPortfolioCategories,
  getPortfolioProjects,
  type PortfolioCategory,
} from "@/lib/web-agency-portfolio";

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function WebAgencyLavoriPage() {
  const reduced = useReducedMotion();
  const projects = getPortfolioProjects();
  const categories = getPortfolioCategories();
  const [filter, setFilter] = useState<PortfolioCategory | "Tutti">("Tutti");

  const filtered = useMemo(
    () => (filter === "Tutti" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );

  const showcaseItems = filtered.map((p) => ({
    title: p.title,
    description: p.summary,
    year: String(p.year),
    link: `/web-agency/lavori/${p.slug}`,
    image: p.cover,
    category: p.category,
  }));

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-100 bg-linear-to-b from-slate-50 to-white pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#0084ff]/15 blur-[90px]" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[#60B1FF]/20 blur-[80px]" />
        <Container>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: SPRING_EASE }}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
          >
            Portfolio
          </motion.p>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: SPRING_EASE }}
            className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Progetti reali.
            <span className="block bg-linear-to-r from-[#0084ff] to-[#60B1FF] bg-clip-text text-transparent">
              Impatto misurabile.
            </span>
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: SPRING_EASE }}
            className="mt-5 max-w-xl text-base text-slate-500 md:text-lg"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Landing, siti vetrina, e-commerce e piattaforme. Scorri i lavori e apri il case study
            che ti interessa.
          </motion.p>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: SPRING_EASE }}
            className="mt-8"
          >
            <Link href="/web-agency#pricing-section" className="inline-flex">
              <ShimmerButton className="uppercase tracking-[0.18em]">Richiedi preventivo</ShimmerButton>
            </Link>
          </motion.div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="mb-10 flex flex-wrap gap-2">
            {(["Tutti", ...categories] as const).map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[#0084ff] text-white shadow-sm shadow-blue-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ProjectShowcase projects={showcaseItems} eyebrow="Case study" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {filtered.map((project, index) => (
                <motion.div
                  key={project.slug}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: SPRING_EASE }}
                >
                  <Link
                    href={`/web-agency/lavori/${project.slug}`}
                    className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#0084ff]/30 hover:shadow-xl"
                  >
                    <div className="relative aspect-16/10 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.cover}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {project.category}
                      </span>
                      {project.demoReady ? (
                        <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                          Demo navigabile
                        </span>
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3
                        className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {project.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.summary}</p>
                      <p className="mt-3 text-xs font-semibold text-[#0084ff]">
                        {project.demoReady ? "Case study + demo live →" : "Apri case study →"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
