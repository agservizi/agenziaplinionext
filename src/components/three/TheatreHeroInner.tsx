"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/** Lightweight hero accent without full Theatre project load (fallback timeline) */
export default function TheatreHeroInner() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.25) * 0.15;
    ref.current.position.y = Math.sin(t * 0.5) * 0.08;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, -2]}>
        <ringGeometry args={[1.2, 1.35, 64]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0, -2.1]}>
        <ringGeometry args={[0.7, 0.82, 64]} />
        <meshBasicMaterial color="#5E0ED7" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
