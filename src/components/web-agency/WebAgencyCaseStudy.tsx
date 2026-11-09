"use client";

/**
 * Caller: web-agency/lavori/[slug]. Uses PortfolioProject.demoPath (relative or absolute).
 * User: Implement plan — Nuvera external demo opens target=_blank.
 */
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/Container";
import { ShimmerButton } from "@/components/ui/21st/shimmer-button";
import { isExternalDemoPath, type PortfolioProject } from "@/lib/web-agency-portfolio";

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Renders ShimmerButton as <a href> — nested button-in-Link broke navigation. */
function DemoCta({ href, label = "Apri demo live" }: { href: string; label?: string }) {
  const external = isExternalDemoPath(href);
  return (
    <ShimmerButton
      href={href}
      className="uppercase tracking-[0.18em]"
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {label}
    </ShimmerButton>
  );
}

export default function WebAgencyCaseStudy({ project }: { project: PortfolioProject }) {
  const reduced = useReducedMotion();

  return (
    <article className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden pt-24 md:pt-28">
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Link
            href="/web-agency/lavori"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0084ff]"
          >
            ← Tutti i lavori
          </Link>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: SPRING_EASE }}
            className="mt-6"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0084ff]">
              <span>{project.category}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{project.year}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{project.client}</span>
            </div>
            <h1
              className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {project.title}
            </h1>
            <p
              className="mt-5 max-w-2xl text-lg text-slate-500"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {project.summary}
            </p>
            {project.demoReady ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <DemoCta href={project.demoPath} />
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                  Demo navigabile
                </span>
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: SPRING_EASE }}
            className="mt-10 overflow-hidden rounded-3xl border border-slate-200 shadow-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover}
              alt={project.title}
              className="aspect-16/9 w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]">
                Sfida
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
                {project.challenge}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]">
                Approccio
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
                {project.approach}
              </p>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]">
              Risultati
            </p>
            <ul className="mt-5 grid gap-3 md:grid-cols-3">
              {project.results.map((result) => (
                <li
                  key={result}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800"
                >
                  {result}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]">
              Stack
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {project.gallery.length > 1 ? (
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {project.gallery.map((src) => (
                <div
                  key={src}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-16/10 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-16 rounded-3xl border border-[#0084ff]/20 bg-linear-to-br from-[#0084ff]/8 to-white p-8 md:p-12">
            <h2
              className="text-2xl font-bold text-slate-900 md:text-3xl"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Vuoi un risultato simile?
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Raccontaci il progetto: ti diciamo tempi, approccio e budget indicativo senza
              impegno.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {project.demoReady ? <DemoCta href={project.demoPath} /> : null}
              <Link
                href="/web-agency#pricing-section"
                className="inline-flex items-center border border-[var(--ink)]/25 bg-transparent px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Parliamone
              </Link>
              <Link
                href="/web-agency/lavori"
                className="inline-flex items-center border border-[var(--ink)]/25 bg-transparent px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Altri lavori
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}
