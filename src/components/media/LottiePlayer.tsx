"use client";

import { Lottie } from "lottie-react";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/preferences";

type LottiePlayerProps = {
  src: string;
  className?: string;
  loop?: boolean;
  ariaLabel?: string;
};

export default function LottiePlayer({
  src,
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

  return (
    <Lottie
      src={src}
      loop={loop}
      autoplay
      className={className}
      aria-label={ariaLabel}
    />
  );
}
