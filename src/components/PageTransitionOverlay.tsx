"use client";

import Image from "next/image";
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
      if (hideTimerRef.current) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      if (progressTimerRef.current) { window.clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
    };

    const startOverlay = () => {
      clearTimers();
      setProgress(15);
      setPhase("enter");
      progressTimerRef.current = window.setInterval(() => {
        setProgress((c) => c >= 90 ? c : Math.min(c + Math.max(2, (92 - c) * 0.12), 90));
      }, 70);
    };

    const onStart = () => startOverlay();
    const onPopState = () => startOverlay();

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let destination: URL;
      try { destination = new URL(anchor.href, window.location.href); } catch { return; }
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
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
    // Always trigger exit when pathname changes, even if phase got stuck
    if (progressTimerRef.current) { window.clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
    if (hideTimerRef.current) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    if (phase === "hidden") {
      // Pathname changed without enter — force a quick flash
      setProgress(100);
      setPhase("exit");
      hideTimerRef.current = window.setTimeout(() => {
        setPhase("hidden");
        setProgress(0);
        hideTimerRef.current = null;
      }, 400);
      return;
    }
    setProgress(100);
    setPhase("exit");
    hideTimerRef.current = window.setTimeout(() => {
      setPhase("hidden");
      setProgress(0);
      hideTimerRef.current = null;
    }, 1400);
    return () => {
      if (hideTimerRef.current) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      if (progressTimerRef.current) { window.clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
    };
  }, [pathname, phase]);

  if (phase === "hidden" && progress === 0) return null;

  const entering = phase === "enter";
  const exiting = phase === "exit";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-90">

      {/* ── Curtain wipe ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)",
          transform: entering ? "translateY(0%)" : exiting ? "translateY(-100%)" : "translateY(100%)",
          transition: entering
            ? "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)"
            : exiting
              ? "transform 800ms cubic-bezier(0.55, 0, 1, 0.45)"
              : "none",
        }}
      >
        {/* Gradient orbs on curtain */}
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,14,215,0.3), transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "15%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)", filter: "blur(50px)" }} />
      </div>

      {/* ── Center content on curtain ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          opacity: entering ? 1 : 0,
          transition: entering ? "opacity 400ms ease-out 300ms" : "opacity 350ms ease-out",
          zIndex: 2,
        }}
      >
        {/* Logo */}
        <Image
          src="/logo.png"
          alt=""
          width={155}
          height={32}
          style={{
            height: 32,
            width: "auto",
            animation: entering ? "transMonogramFloat 2s ease-in-out infinite" : "none",
          }}
        />

        {/* Progress track */}
        <div style={{ width: 120, height: 3, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 4,
              background: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee)",
              width: `${progress}%`,
              transition: "width 150ms ease-out",
            }}
          />
        </div>
      </div>

      {/* ── Top accent line (always visible during transition) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 2,
          width: `${progress}%`,
          background: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee)",
          transition: exiting ? "width 250ms ease-out, opacity 400ms ease-out" : "width 120ms ease-out",
          opacity: exiting ? 0 : 1,
          zIndex: 3,
        }}
      />

      <style>{`
        @keyframes transMonogramFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
