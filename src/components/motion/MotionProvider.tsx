"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/motion/gsap";
import {
  prefersReducedMotion,
  supportsFinePointer,
} from "@/lib/motion/preferences";

type MotionProviderProps = {
  children: ReactNode;
  onScrollRefresh?: () => void;
};

export default function MotionProvider({
  children,
  onScrollRefresh,
}: MotionProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    registerGsapPlugins();
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

      gsap.utils.toArray<HTMLElement>("[data-gsap-stagger]").forEach((container) => {
        const items = container.querySelectorAll<HTMLElement>("[data-gsap-stagger-item]");
        if (!items.length) return;
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container,
              start: "top 82%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-text-split]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 24, filter: "blur(6px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-scale]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, scale: 0.92 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
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

    const refreshTimers = [
      window.setTimeout(() => ScrollTrigger.refresh(), 250),
      window.setTimeout(() => ScrollTrigger.refresh(), 1200),
    ];

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    onScrollRefresh?.();

    return () => {
      refreshTimers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      ctx.revert();
      lenis?.off("scroll", updateScrollTrigger);
      if (lenis) gsap.ticker.remove(tick);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname, onScrollRefresh]);

  return <>{children}</>;
}
