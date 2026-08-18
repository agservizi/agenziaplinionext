"use client";

import { getProject, types } from "@theatre/core";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Trail } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { homeHeroTheatreState } from "@/lib/theatre/home-hero";

type RingValues = {
  rotationY: number;
  y: number;
  scale: number;
  glow: number;
};

const DEFAULTS: RingValues = {
  rotationY: 0,
  y: 0,
  scale: 1,
  glow: 0.22,
};

export default function TheatreHeroInner() {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const values = useRef<RingValues>({ ...DEFAULTS });
  const progress = useScrollProgress();

  const sheet = useMemo(() => {
    const project = getProject("AG Hero", { state: homeHeroTheatreState });
    const next = project.sheet("Hero");
    next.object("Rings", {
      rotationY: types.number(DEFAULTS.rotationY, { range: [0, Math.PI * 2] }),
      y: types.number(DEFAULTS.y, { range: [-2, 2] }),
      scale: types.number(DEFAULTS.scale, { range: [0.4, 1.6] }),
      glow: types.number(DEFAULTS.glow, { range: [0, 1] }),
    });
    return next;
  }, []);

  useEffect(() => {
    const object = sheet.object("Rings", {
      rotationY: types.number(DEFAULTS.rotationY, { range: [0, Math.PI * 2] }),
      y: types.number(DEFAULTS.y, { range: [-2, 2] }),
      scale: types.number(DEFAULTS.scale, { range: [0.4, 1.6] }),
      glow: types.number(DEFAULTS.glow, { range: [0, 1] }),
    });
    const unsubscribe = object.onValuesChange((next) => {
      values.current = next as RingValues;
    });
    return () => {
      unsubscribe();
    };
  }, [sheet]);

  useFrame(({ clock }) => {
    sheet.sequence.position = progress * 2;
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const { rotationY, y, scale, glow } = values.current;
    group.current.rotation.y = rotationY + Math.sin(t * 0.2) * 0.08;
    group.current.rotation.z = progress * 0.08;
    group.current.position.y = y + Math.sin(t * 0.45) * 0.04;
    group.current.scale.setScalar(scale);
    if (core.current) {
      const material = core.current.material as { emissiveIntensity?: number; opacity?: number };
      if (typeof material.emissiveIntensity === "number") {
        material.emissiveIntensity = 0.3 + glow;
      }
      if (typeof material.opacity === "number") {
        material.opacity = 0.18 + glow * 0.45;
      }
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.35} rotationIntensity={0.3} floatIntensity={0.4}>
        <Trail width={0.18} length={5} color="#22d3ee" decay={1} attenuation={(width) => width}>
          <mesh ref={core} position={[1.85, 0.45, -1.35]}>
          <icosahedronGeometry args={[0.16, 1]} />
          <MeshDistortMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.35}
            distort={0.35}
            speed={2.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        </Trail>
      </Float>
      <mesh position={[0, 0, -2]}>
        <ringGeometry args={[1.25, 1.42, 96]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.16} />
      </mesh>
      <mesh position={[0, 0, -2.08]} rotation={[0, 0, Math.PI / 6]}>
        <ringGeometry args={[0.95, 1.05, 96]} />
        <meshBasicMaterial color="#5E0ED7" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0, -2.15]}>
        <torusGeometry args={[0.76, 0.045, 16, 80]} />
        <meshStandardMaterial
          color="#5E0ED7"
          emissive="#7c3aed"
          emissiveIntensity={0.45}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, 0, -2.22]} rotation={[0, 0, -Math.PI / 4]}>
        <ringGeometry args={[0.38, 0.46, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}
