"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type PortfolioGalleryImage = {
  src: string;
  alt: string;
  title?: string;
  href?: string;
};

type PortfolioGalleryProps = {
  title?: string;
  archiveButton?: {
    text: string;
    href: string;
  };
  images?: PortfolioGalleryImage[];
  className?: string;
  maxHeight?: number;
  spacing?: string;
  onImageClick?: (index: number) => void;
  pauseOnHover?: boolean;
  marqueeRepeat?: number;
};

export function PortfolioGallery({
  title = "Lavori selezionati",
  archiveButton = {
    text: "Vedi tutti i lavori",
    href: "/web-agency/lavori",
  },
  images = [],
  className = "",
  maxHeight = 120,
  spacing = "-space-x-72 md:-space-x-80",
  onImageClick,
  pauseOnHover = true,
  marqueeRepeat = 3,
}: PortfolioGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section aria-label={title} className={cn("relative px-4 py-16 md:py-24", className)}>
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <div className="relative z-10 px-6 pb-8 pt-14 text-center md:px-8 md:pt-16">
          <h2
            className="mb-8 text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-6xl"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {title}
          </h2>

          <Link
            href={archiveButton.href}
            className="group mb-12 inline-flex items-center gap-3 rounded-full bg-[#0084ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#006fd6] md:mb-16"
          >
            <span>{archiveButton.text}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Desktop 3D overlapping layout */}
        <div className="relative -mb-[160px] hidden h-[360px] overflow-hidden md:block">
          <div className={cn("flex items-end justify-center pb-8 pt-36", spacing)}>
            {images.map((image, index) => {
              const totalImages = images.length;
              const middle = Math.floor(totalImages / 2);
              const distanceFromMiddle = Math.abs(index - middle);
              const staggerOffset = maxHeight - distanceFromMiddle * 20;
              const zIndex = totalImages - index;
              const isHovered = hoveredIndex === index;
              const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
              const yOffset = reduced ? -staggerOffset : isHovered ? -120 : isOtherHovered ? 0 : -staggerOffset;

              const body = (
                <div
                  className="relative aspect-video w-64 overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105 md:w-80 lg:w-96"
                  style={{
                    boxShadow:
                      "rgba(0,0,0,0.03) 2px 0 2px, rgba(0,0,0,0.08) 6px 0 6px, rgba(0,0,0,0.2) 18px 0 18px",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover object-left-top"
                    loading="lazy"
                    decoding="async"
                  />
                  {image.title ? (
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">{image.title}</p>
                    </div>
                  ) : null}
                </div>
              );

              return (
                <motion.div
                  key={`${image.src}-${index}`}
                  className="group shrink-0 cursor-pointer"
                  style={{ zIndex }}
                  initial={
                    reduced
                      ? false
                      : {
                          transform: "perspective(5000px) rotateY(-45deg) translateY(200px)",
                          opacity: 0,
                        }
                  }
                  animate={{
                    transform: `perspective(5000px) rotateY(${reduced ? 0 : -45}deg) translateY(${yOffset}px)`,
                    opacity: 1,
                  }}
                  transition={{
                    duration: reduced ? 0 : 0.25,
                    delay: reduced ? 0 : index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onHoverStart={() => {
                    if (!reduced) setHoveredIndex(index);
                  }}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={() => onImageClick?.(index)}
                >
                  {image.href ? <Link href={image.href}>{body}</Link> : body}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile marquee */}
        <div className="relative block pb-8 md:hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)]">
            {Array.from({ length: marqueeRepeat }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex shrink-0 justify-around [gap:var(--gap)]",
                  !reduced && "portfolio-marquee-track",
                  pauseOnHover && "group-hover:[animation-play-state:paused]",
                )}
              >
                {images.map((image, index) => {
                  const inner = (
                    <div
                      key={`${i}-${index}`}
                      className="group shrink-0 cursor-pointer"
                      onClick={() => onImageClick?.(index)}
                    >
                      <div className="relative aspect-video w-64 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover object-left-top"
                          loading="lazy"
                          decoding="async"
                        />
                        {image.title ? (
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 py-2">
                            <p className="truncate text-xs font-semibold text-white">{image.title}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                  return image.href ? (
                    <Link key={`${i}-${index}`} href={image.href}>
                      {inner}
                    </Link>
                  ) : (
                    inner
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
