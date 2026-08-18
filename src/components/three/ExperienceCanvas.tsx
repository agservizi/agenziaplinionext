"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { supportsImmersive3D } from "@/lib/motion/preferences";

const AmbientScene = dynamic(() => import("./AmbientScene"), { ssr: false });

export default function ExperienceCanvas() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(supportsImmersive3D());
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <Suspense fallback={null}>
        <AmbientScene />
      </Suspense>
    </div>
  );
}
