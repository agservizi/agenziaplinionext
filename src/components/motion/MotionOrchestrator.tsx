"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsFinePointer() {
  return window.matchMedia("(pointer: fine) and (min-width: 768px)").matches;
}

export default function MotionOrchestrator({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const smoothScrollEnabled = supportsFinePointer();
    const lenis = smoothScrollEnabled
      ? new Lenis({
          anchors: true,
          autoRaf: false,
          lerp: 0.085,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.9,
        })
      : null;

    const updateScrollTrigger = () => ScrollTrigger.update();
    lenis?.on("scroll", updateScrollTrigger);

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
    };

    if (lenis) {
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]").forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 52, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            delay: Math.min(index * 0.035, 0.18),
            ease: "power4.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]").forEach((element) => {
        const distance = Number(element.dataset.gsapParallax || 80);
        gsap.fromTo(
          element,
          { y: -distance * 0.35 },
          {
            y: distance * 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-pin]").forEach((element) => {
        ScrollTrigger.create({
          trigger: element,
          start: "top top+=96",
          end: "bottom top+=35%",
          pin: element.querySelector<HTMLElement>("[data-gsap-pin-target]") || element,
          pinSpacing: false,
        });
      });
    });

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 250);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
      lenis?.off("scroll", updateScrollTrigger);
      if (lenis) gsap.ticker.remove(tick);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname]);

  return <>{children}</>;
}