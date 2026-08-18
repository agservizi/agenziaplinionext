"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { supportsImmersive3D } from "@/lib/motion/preferences";
import { ScrollInvalidator } from "./ScrollCameraRig";

const TheatreHeroInner = dynamic(() => import("./TheatreHeroInner"), { ssr: false });

type TheatreHeroProps = {
  className?: string;
};

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
          frameloop="always"
          camera={{ position: [0, 0, 4], fov: 48 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%" }}
        >
          <ScrollInvalidator />
          <TheatreHeroInner />
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <Bloom intensity={0.45} luminanceThreshold={0.12} luminanceSmoothing={0.88} mipmapBlur />
            <ChromaticAberration offset={[0.001, 0.0007]} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
