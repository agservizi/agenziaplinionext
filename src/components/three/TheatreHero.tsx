"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { supportsImmersive3D } from "@/lib/motion/preferences";

const TheatreHeroInner = dynamic(() => import("./TheatreHeroInner"), { ssr: false });

type TheatreHeroProps = {
  className?: string;
};

/** Theatre.js timeline hook for hero — desktop only */
export default function TheatreHero({ className = "" }: TheatreHeroProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(supportsImmersive3D());
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className={className}>
      <Suspense fallback={null}>
        <TheatreHeroInner />
      </Suspense>
    </div>
  );
}
