"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Phase = "hidden" | "enter" | "exit";

export default function PageTransitionOverlay() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("hidden");
  const [progress, setProgress] = useState(0);
  const hideTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };

    const startOverlay = () => {
      clearTimers();
      setProgress(8);
      setPhase("enter");
      progressTimerRef.current = window.setInterval(() => {
        setProgress((current) => {
          if (current >= 84) return current;
          const next = current + Math.max(2, (90 - current) * 0.12);
          return Math.min(next, 84);
        });
      }, 90);
    };

    const onStart = () => {
      startOverlay();
    };

    const onPopState = () => {
      startOverlay();
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;

      const currentPathWithQuery = `${window.location.pathname}${window.location.search}`;
      const destinationPathWithQuery = `${destination.pathname}${destination.search}`;
      if (destinationPathWithQuery === currentPathWithQuery) return;

      startOverlay();
    };

    window.addEventListener("ag-page-transition-start", onStart);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onDocumentClick, true);
    return () => {
      clearTimers();
      window.removeEventListener("ag-page-transition-start", onStart);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    if (phase === "hidden") return;

    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setProgress(100);
    setPhase("exit");
    hideTimerRef.current = window.setTimeout(() => {
      setPhase("hidden");
      setProgress(0);
      hideTimerRef.current = null;
    }, 420);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [pathname, phase]);

  if (phase === "hidden" && progress === 0) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div
        className={
          phase === "enter"
            ? "absolute inset-y-0 left-0 w-[115%] translate-x-0 bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900/95 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            : phase === "exit"
              ? "absolute inset-y-0 left-0 w-[115%] translate-x-[110%] bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900/95 transition-transform duration-450 ease-[cubic-bezier(0.55,0,1,0.45)]"
              : "absolute inset-y-0 left-0 w-[115%] -translate-x-[115%] bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900/95 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        }
      />
      <div
        className={
          phase === "enter"
            ? "absolute left-1/2 top-1/2 w-[min(72vw,340px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-slate-900/80 p-4 opacity-100 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-sm transition-opacity duration-200"
            : phase === "exit"
              ? "absolute left-1/2 top-1/2 w-[min(72vw,340px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-slate-900/80 p-4 opacity-0 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-sm transition-opacity duration-300"
              : "absolute left-1/2 top-1/2 w-[min(72vw,340px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-slate-900/80 p-4 opacity-0"
        }
      >
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Caricamento pagina
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-cyan-300 via-cyan-500 to-white transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <p className="text-right text-xs font-medium text-white/70">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
