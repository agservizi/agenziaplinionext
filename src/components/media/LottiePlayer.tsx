"use client";

import { Lottie } from "lottie-react";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/preferences";

type LottiePlayerProps = {
  src?: string;
  animationData?: object;
  className?: string;
  loop?: boolean;
  ariaLabel?: string;
};

export default function LottiePlayer({
  src,
  animationData,
  className = "h-10 w-10",
  loop = true,
  ariaLabel,
}: LottiePlayerProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!prefersReducedMotion());
  }, []);

  if (!enabled) {
    return (
      <span
        className={`inline-block rounded-full bg-cyan-500/20 ${className}`}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
      />
    );
  }

  const source = animationData ?? src;
  if (!source) {
    return (
      <span
        className={`inline-block rounded-full bg-cyan-500/20 ${className}`}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <Lottie
      src={source}
      loop={loop}
      autoplay
      className={className}
      aria-label={ariaLabel}
    />
  );
}
