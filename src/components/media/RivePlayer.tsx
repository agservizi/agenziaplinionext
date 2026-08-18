"use client";

import { useRive } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/preferences";

type RivePlayerProps = {
  src: string;
  className?: string;
  ariaLabel?: string;
};

function RiveInner({ src, className, ariaLabel }: RivePlayerProps) {
  const { RiveComponent } = useRive({ src, autoplay: true });

  return (
    <div className={className} aria-label={ariaLabel} role={ariaLabel ? "img" : undefined}>
      <RiveComponent />
    </div>
  );
}

export default function RivePlayer({ src, className = "h-10 w-10", ariaLabel }: RivePlayerProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!prefersReducedMotion());
  }, []);

  if (!enabled) {
    return (
      <span
        className={`inline-block rounded-lg bg-[#5E0ED7]/20 ${className}`}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
      />
    );
  }

  return <RiveInner src={src} className={className} ariaLabel={ariaLabel} />;
}
