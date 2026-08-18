"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { supportsImmersive3D } from "@/lib/motion/preferences";

const TheatreHeroInner = dynamic(() => import("./TheatreHeroInner"), { ssr: false });

type TheatreHeroProps = {
  className?: string;
};

/** Hero accent rings — desktop only, must render inside Canvas for R3F hooks */
export default function TheatreHero({ className = "" }: TheatreHeroProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(supportsImmersive3D());
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className={className}>
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4], fov: 50 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%" }}
        >
          <TheatreHeroInner />
        </Canvas>
      </Suspense>
    </div>
  );
}
