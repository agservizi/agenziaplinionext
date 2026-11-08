"use client";

/**
 * Callers: root layout.
 * API: pointer overlay tip + trailing square frame.
 * Schema: luminance sample under cursor → ink/paper contrast; dual ring always visible on dark/light.
 * User: "il puntatore su fondo scuro scompare non è visibile"
 */
import { useEffect, useRef, useState } from "react";

const PAPER = "#e8e2d6";
const INK = "#0b1120";
const ACCENT = "#5E0ED7";

const LIGHT_CLASS = [
  "lux-surface",
  "bg-white",
  "bg-slate-50",
  "bg-slate-100",
  "bg-[var(--paper)]",
  "bg-[color-mix(in_srgb,var(--paper)",
];

const DARK_CLASS = [
  "bg-slate-950",
  "bg-slate-900",
  "bg-slate-800",
  "bg-black",
  "bg-[var(--ink)]",
  "hero-gradient",
  "bg-[#11102a]",
  "bg-[#171334]",
  "bg-[#0f1d32]",
  "bg-[#0b1120]",
  "from-slate-950",
  "from-slate-900",
  "text-white",
];

function parseRgba(bg: string): { r: number; g: number; b: number; a: number } | null {
  const m = bg.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] !== undefined ? Number(m[4]) : 1,
  };
}

function luminance(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function isOnLightBackground(x: number, y: number): boolean {
  let el: Element | null = document.elementFromPoint(x, y);

  while (el && el !== document.documentElement) {
    if (el instanceof HTMLElement) {
      const cls = typeof el.className === "string" ? el.className : "";

      for (const light of LIGHT_CLASS) {
        if (cls.includes(light)) return true;
      }
      for (const dark of DARK_CLASS) {
        if (cls.includes(dark)) return false;
      }

      const bg = window.getComputedStyle(el).backgroundColor;
      const rgba = parseRgba(bg);
      if (rgba && rgba.a >= 0.72) {
        return luminance(rgba.r, rgba.g, rgba.b) >= 0.48;
      }
    }
    el = el.parentElement;
  }

  const bodyBg = parseRgba(window.getComputedStyle(document.body).backgroundColor);
  if (bodyBg && bodyBg.a >= 0.72) {
    return luminance(bodyBg.r, bodyBg.g, bodyBg.b) >= 0.48;
  }

  return true;
}

export default function CustomCursor() {
  const tipRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const box = useRef({ x: 0, y: 0 });
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
      if (tipRef.current) {
        tipRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
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
      box.current.x += (mouse.current.x - box.current.x) * 0.22;
      box.current.y += (mouse.current.y - box.current.y) * 0.22;
      if (boxRef.current) {
        boxRef.current.style.transform = `translate(${box.current.x}px, ${box.current.y}px)`;
      }

      luminanceCheck.current++;
      if (luminanceCheck.current % 4 === 0) {
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

  // Fill adapts to surface; dual ring (ink + paper) keeps tip/frame readable on both.
  const fill = hovering ? ACCENT : isDark ? PAPER : INK;
  const ringOuter = isDark ? INK : PAPER;
  const ringInner = isDark ? PAPER : INK;
  const boxSize = clicking ? (hovering ? 28 : 18) : hovering ? 36 : 22;
  const tipSize = clicking ? 5 : hovering ? 7 : 6;
  const dualRing = `0 0 0 1px ${ringOuter}, 0 0 0 2.5px ${ringInner}`;

  return (
    <>
      {showToast ? (
        <div
          className="pointer-events-none fixed z-9999"
          style={{
            left: toastPos.current.x,
            top: toastPos.current.y - 44,
            transform: "translateX(-50%)",
            animation: "cursorToastIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
            Contenuto protetto
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes cursorToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div
        ref={tipRef}
        className="pointer-events-none fixed left-0 top-0 z-9999"
        style={{
          width: tipSize,
          height: tipSize,
          marginLeft: -tipSize / 2,
          marginTop: -tipSize / 2,
          background: fill,
          boxShadow: dualRing,
          transition: "background 0.15s, width 0.12s, height 0.12s, margin 0.12s, box-shadow 0.15s",
        }}
      />

      <div
        ref={boxRef}
        className="pointer-events-none fixed left-0 top-0 z-9998"
        style={{
          width: boxSize,
          height: boxSize,
          marginLeft: -boxSize / 2,
          marginTop: -boxSize / 2,
          border: `1.5px solid ${hovering ? ACCENT : ringInner}`,
          boxShadow: `0 0 0 1.5px ${ringOuter}`,
          background: hovering
            ? isDark
              ? "rgba(94,14,215,0.18)"
              : "rgba(94,14,215,0.08)"
            : "transparent",
          transition:
            "width 0.2s cubic-bezier(0.16,1,0.3,1), height 0.2s cubic-bezier(0.16,1,0.3,1), margin 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.15s, background 0.15s, box-shadow 0.15s",
        }}
      />
    </>
  );
}
