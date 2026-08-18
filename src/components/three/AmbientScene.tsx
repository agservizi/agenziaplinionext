"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useRef } from "react";
import type { Mesh } from "three";

function BrandOrbs() {
  const group = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.08;
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[-2.4, 0.6, -4]}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#5E0ED7" emissive="#5E0ED7" emissiveIntensity={0.35} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[2.8, -0.4, -5]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh position={[0.2, 1.2, -6]}>
          <torusGeometry args={[0.7, 0.08, 16, 48]} />
          <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.25} />
        </mesh>
      </Float>
    </group>
  );
}

export default function AmbientScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-4, -2, 2]} intensity={0.8} color="#5E0ED7" />
      <Stars radius={80} depth={40} count={1200} factor={3} saturation={0.2} fade speed={0.4} />
      <BrandOrbs />
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.35} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        <Vignette eskil={false} offset={0.2} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
