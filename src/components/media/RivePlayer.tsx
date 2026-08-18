"use client";

import { useRive } from "@rive-app/react-canvas";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/preferences";

type RivePlayerProps = {
  src?: string;
  className?: string;
  ariaLabel?: string;
  stateMachines?: string;
  hover?: boolean;
};

function RiveInner({
  src,
  className,
  ariaLabel,
  stateMachines = "State Machine 1",
}: RivePlayerProps) {
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    stateMachines,
  });

  return (
    <div className={className} aria-label={ariaLabel} role={ariaLabel ? "img" : undefined}>
      <RiveComponent />
    </div>
  );
}

function RiveStateMark({ className, hover }: { className?: string; hover?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ring = svg.querySelector(".rive-ring");
    const core = svg.querySelector(".rive-core");
    const spark = svg.querySelector(".rive-spark");
    if (!ring || !core || !spark) return;

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "agCinematic" } });
    tl.to(ring, { rotate: 180, transformOrigin: "50% 50%", duration: 2.4 }, 0)
      .to(core, { scale: 1.18, transformOrigin: "50% 50%", duration: 1.2, yoyo: true, repeat: 1 }, 0)
      .to(spark, { autoAlpha: 0.35, duration: 1.2, yoyo: true, repeat: 1 }, 0);

    if (hover) {
      gsap.to([ring, core], { scale: 1.12, duration: 0.35, transformOrigin: "50% 50%", overwrite: "auto" });
    }

    return () => {
      tl.kill();
    };
  }, [hover]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <circle className="rive-ring" cx="32" cy="32" r="18" fill="none" stroke="#22d3ee" strokeWidth="1.6" opacity="0.7" />
      <circle className="rive-spark" cx="32" cy="32" r="24" fill="none" stroke="#5E0ED7" strokeWidth="1" opacity="0.35" />
      <circle className="rive-core" cx="32" cy="32" r="7" fill="#5E0ED7" opacity="0.85" />
    </svg>
  );
}

export default function RivePlayer({
  src,
  className = "h-10 w-10",
  ariaLabel,
  stateMachines,
  hover = false,
}: RivePlayerProps) {
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

  if (src) {
    return (
      <RiveInner
        src={src}
        className={className}
        ariaLabel={ariaLabel}
        stateMachines={stateMachines}
      />
    );
  }

  return <RiveStateMark className={className} hover={hover} />;
}
