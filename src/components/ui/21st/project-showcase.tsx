"use client";

import type React from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ProjectShowcaseItem = {
  title: string;
  description: string;
  year: string;
  link: string;
  image: string;
  category?: string;
};

type ProjectShowcaseProps = {
  eyebrow?: string;
  projects: ProjectShowcaseItem[];
  className?: string;
};

export function ProjectShowcase({
  eyebrow = "Lavori selezionati",
  projects,
  className,
}: ProjectShowcaseProps) {
  const reduced = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition, reduced]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("relative w-full max-w-3xl px-2 py-4 md:px-0", className)}
    >
      <p
        className="mb-8 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {eyebrow}
      </p>

      {!reduced ? (
        <div
          className="pointer-events-none absolute z-50 overflow-hidden rounded-xl shadow-2xl"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${smoothPosition.x + 24}px, ${smoothPosition.y - 110}px, 0)`,
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.85,
            transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="relative h-[180px] w-[280px] overflow-hidden rounded-xl bg-slate-100">
            {projects.map((project, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={project.title}
                src={project.image}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out"
                style={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  transform: hoveredIndex === index ? "scale(1)" : "scale(1.08)",
                  filter: hoveredIndex === index ? "none" : "blur(10px)",
                }}
              />
            ))}
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/30 to-transparent" />
          </div>
        </div>
      ) : null}

      <div className="space-y-0">
        {projects.map((project, index) => (
          <Link
            key={project.title}
            href={project.link}
            className="group block"
            onMouseEnter={() => {
              setHoveredIndex(index);
              if (!reduced) setIsVisible(true);
            }}
            onMouseLeave={() => {
              setHoveredIndex(null);
              setIsVisible(false);
            }}
          >
            <div className="relative border-t border-slate-200 py-5 transition-all duration-300 ease-out">
              <div
                className={cn(
                  "absolute inset-0 -mx-3 rounded-xl bg-[#0084ff]/6 px-3 transition-all duration-300 ease-out md:-mx-4 md:px-4",
                  hoveredIndex === index ? "scale-100 opacity-100" : "scale-95 opacity-0",
                )}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2">
                    <h3
                      className="text-lg font-semibold tracking-tight text-slate-900"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      <span className="relative">
                        {project.title}
                        <span
                          className={cn(
                            "absolute bottom-0 left-0 h-px bg-[#0084ff] transition-all duration-300 ease-out",
                            hoveredIndex === index ? "w-full" : "w-0",
                          )}
                        />
                      </span>
                    </h3>
                    <svg
                      viewBox="0 0 24 24"
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-all duration-300 ease-out",
                        hoveredIndex === index
                          ? "translate-x-0 translate-y-0 opacity-100"
                          : "-translate-x-2 translate-y-2 opacity-0",
                      )}
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 17L17 7M9 7h8v8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-sm leading-relaxed transition-colors duration-300",
                      hoveredIndex === index ? "text-slate-700" : "text-slate-500",
                    )}
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {project.description}
                  </p>
                  {project.category ? (
                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {project.category}
                    </span>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums text-slate-400 transition-colors duration-300",
                    hoveredIndex === index && "text-slate-600",
                  )}
                >
                  {project.year}
                </span>
              </div>
            </div>
          </Link>
        ))}
        <div className="border-t border-slate-200" />
      </div>
    </section>
  );
}
