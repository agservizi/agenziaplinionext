"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LOTTIE_ICONS } from "@/lib/motion/lottie-icons";
import { supportsImmersive3D } from "@/lib/motion/preferences";

const LottiePlayer = dynamic(() => import("@/components/media/LottiePlayer"), {
  ssr: false,
});

const RivePlayer = dynamic(() => import("@/components/media/RivePlayer"), {
  ssr: false,
});

const ICONS = {
  luggage: { type: "lottie" as const, data: LOTTIE_ICONS.spark },
  locker: { type: "lottie" as const, data: LOTTIE_ICONS.package },
  send: { type: "lottie" as const, data: LOTTIE_ICONS.send },
  client: { type: "rive" as const },
  services: { type: "lottie" as const, data: LOTTIE_ICONS.spark },
} as const;

export type ServiceMotionIconId = keyof typeof ICONS;

type ServiceMotionIconProps = {
  id: ServiceMotionIconId;
  className?: string;
  hover?: boolean;
};

export default function ServiceMotionIcon({
  id,
  className = "h-9 w-9",
  hover = false,
}: ServiceMotionIconProps) {
  const [enabled, setEnabled] = useState(false);
  const config = ICONS[id];

  useEffect(() => {
    setEnabled(supportsImmersive3D() || (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  }, []);

  if (!enabled) {
    return (
      <span
        aria-hidden
        className={`inline-block rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/20 ${className}`}
      />
    );
  }

  if (config.type === "rive") {
    return <RivePlayer className={className} hover={hover} />;
  }

  return <LottiePlayer animationData={config.data} className={className} ariaLabel="" />;
}
