"use client";

import { useEffect, useRef, useState } from "react";

const LIGHT_INDICATORS = ["lux-surface", "bg-white", "bg-slate-50", "bg-slate-100"];
const DARK_INDICATORS = ["bg-slate-950", "bg-slate-900", "bg-black", "hero-gradient"];

function isOnLightBackground(x: number, y: number): boolean {
  let el: Element | null = document.elementFromPoint(x, y);
  while (el && el !== document.documentElement) {
    const cls = el.className;
    if (typeof cls === "string") {
      for (const light of LIGHT_INDICATORS) {
        if (cls.includes(light)) return true;
      }
      for (const dark of DARK_INDICATORS) {
        if (cls.includes(dark)) return false;
      }
    }
    // Check inline background style
    if (el instanceof HTMLElement && el.style.backgroundColor) {
      const bg = el.style.backgroundColor;
      if (bg.includes("255") || bg.includes("white") || bg.includes("#f")) return true;
      if (bg.includes("0, 0, 0") || bg.includes("black") || bg.includes("#0")) return false;
    }
    el = el.parentElement;
  }
  // Fallback: check if page is light (header has dark text = light page)
  const header = document.querySelector("header");
  if (header) {
    const color = window.getComputedStyle(header).color;
    const match = color.match(/\d+/g);
    if (match) {
      const lum = (Number(match[0]) + Number(match[1]) + Number(match[2])) / 3;
      return lum < 128;
    }
  }
  return false;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const toastPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const toastTimer = useRef(0);
  const luminanceCheck = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    setVisible(true);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [role='button'], input, select, textarea, label, summary")) {
        setHovering(true);
      }
    };

    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [role='button'], input, select, textarea, label, summary")) {
        setHovering(false);
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toastPos.current = { x: e.clientX, y: e.clientY };
      clearTimeout(toastTimer.current);
      setShowToast(true);
      toastTimer.current = window.setTimeout(() => setShowToast(false), 1800);
    };

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }

      luminanceCheck.current++;
      if (luminanceCheck.current % 6 === 0) {
        const light = isOnLightBackground(mouse.current.x, mouse.current.y);
        setIsDark(!light);
      }

      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(toastTimer.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  if (prefersReducedMotion) return null;
  if (!visible) return null;

  const dotColor = isDark ? "#ffffff" : "#5E0ED7";
  const ringBorder = isDark
    ? hovering ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)"
    : hovering ? "rgba(94,14,215,0.5)" : "rgba(94,14,215,0.25)";
  const ringBg = hovering
    ? isDark ? "rgba(255,255,255,0.08)" : "rgba(94,14,215,0.06)"
    : "transparent";

  return (
    <>
      {/* Toast — right click protection */}
      {showToast && (
        <div
          className="pointer-events-none fixed z-9999"
          style={{
            left: toastPos.current.x,
            top: toastPos.current.y - 40,
            transform: "translateX(-50%)",
            animation: "cursorToastIn 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/95 px-4 py-2 shadow-xl backdrop-blur-xl">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#5E0ED7]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span className="text-xs font-semibold text-white/80">Contenuto protetto</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cursorToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.9); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>

      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-9999"
        style={{
          width: clicking ? 6 : 8,
          height: clicking ? 6 : 8,
          marginLeft: clicking ? -3 : -4,
          marginTop: clicking ? -3 : -4,
          borderRadius: "50%",
          background: dotColor,
          transition: "background 0.25s, width 0.15s, height 0.15s",
        }}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-9998"
        style={{
          width: clicking ? (hovering ? 40 : 26) : (hovering ? 48 : 32),
          height: clicking ? (hovering ? 40 : 26) : (hovering ? 48 : 32),
          marginLeft: clicking ? (hovering ? -20 : -13) : (hovering ? -24 : -16),
          marginTop: clicking ? (hovering ? -20 : -13) : (hovering ? -24 : -16),
          borderRadius: "50%",
          border: `1.5px solid ${ringBorder}`,
          background: ringBg,
          transition: "width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1), margin 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.25s, background 0.25s",
        }}
      />
    </>
  );
}
