"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createLenisBridge } from "@/lib/motion/lenis-bridge";
import { registerGsapPlugins, ScrollTrigger } from "@/lib/motion/gsap";
import {
  captureViewFlip,
  mountScrollOrchestrator,
  playViewFlip,
  refreshScrollMotion,
} from "@/lib/motion/scroll-orchestrator";
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
  const flipState = useRef<ReturnType<typeof captureViewFlip> | null>(null);

  useLayoutEffect(() => {
    registerGsapPlugins();
    if (prefersReducedMotion()) return;
    if (flipState.current) {
      playViewFlip(flipState.current);
    }
    flipState.current = captureViewFlip();
  }, [pathname]);

  useEffect(() => {
    registerGsapPlugins();
    if (prefersReducedMotion()) return;

    const lenisHandle = supportsFinePointer() ? createLenisBridge() : null;
    const revertOrchestrator = mountScrollOrchestrator();

    const refreshTimers = [
      window.setTimeout(refreshScrollMotion, 300),
      window.setTimeout(refreshScrollMotion, 1400),
    ];

    const onResize = () => refreshScrollMotion();
    window.addEventListener("resize", onResize);
    onScrollRefresh?.();
    refreshScrollMotion();

    return () => {
      refreshTimers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      revertOrchestrator();
      lenisHandle?.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname, onScrollRefresh]);

  return <>{children}</>;
}
