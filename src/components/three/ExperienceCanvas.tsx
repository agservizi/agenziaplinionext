"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supportsImmersive3D } from "@/lib/motion/preferences";
import { useScrollProgress } from "@/components/motion/useScrollProgress";

const AmbientScene = dynamic(() => import("./AmbientScene"), { ssr: false });

export default function ExperienceCanvas() {
  const [enabled, setEnabled] = useState(false);
  const progress = useScrollProgress();

  useEffect(() => {
    setEnabled(supportsImmersive3D());
  }, []);

  useEffect(() => {
    const refresh = () => setEnabled(supportsImmersive3D());
    window.addEventListener("ag-motion-ready", refresh);
    return () => window.removeEventListener("ag-motion-ready", refresh);
  }, []);

  if (!enabled) return null;

  const opacity = Math.max(0.22, 0.72 - progress * 0.48);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden mix-blend-screen transition-opacity duration-300"
      style={{ opacity }}
      data-experience-canvas
    >
      <Suspense fallback={null}>
        <AmbientScene />
      </Suspense>
    </div>
  );
}
