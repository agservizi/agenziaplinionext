"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sparkles,
  Stars,
  Trail,
} from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import type { Group, PointLight } from "three";
import { Color } from "three";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { getScrollVelocity } from "@/lib/motion/scroll-store";
import { ScrollCameraRig, ScrollInvalidator } from "./ScrollCameraRig";
import CompressedBrandMesh from "./CompressedBrandMesh";

function MouseLight() {
  const light = useRef<PointLight>(null);
  useFrame(({ pointer }) => {
    if (!light.current) return;
    light.current.position.x = pointer.x * 4.5;
    light.current.position.y = pointer.y * 2.8;
  });
  return <pointLight ref={light} intensity={1.8} color="#67e8f9" distance={9} />;
}

function BrandOrbs() {
  const group = useRef<Group>(null);
  const progress = useScrollProgress();

  useFrame((state) => {
    if (!group.current) return;
    const { pointer } = state;
    const t = state.clock.elapsedTime;
    const velocity = getScrollVelocity();
    group.current.rotation.y = t * 0.09 + progress * Math.PI * 0.42 + pointer.x * 0.18;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.07 + pointer.y * 0.12;
    group.current.rotation.z = velocity * 0.04;
    group.current.position.x = pointer.x * 0.35;
    group.current.position.y = pointer.y * 0.2;
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh position={[-2.55, 0.45, -4.1]}>
          <icosahedronGeometry args={[0.68, 8]} />
          <MeshDistortMaterial
            color="#5E0ED7"
            emissive="#5E0ED7"
            emissiveIntensity={0.55}
            roughness={0.28}
            metalness={0.25}
            distort={0.42}
            speed={1.6}
          />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.7}>
        <Trail width={0.28} length={6} color="#22d3ee" decay={1.1} attenuation={(w) => w}>
          <mesh position={[2.85, -0.3, -5]}>
            <octahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.55}
              roughness={0.2}
              metalness={0.45}
            />
          </mesh>
        </Trail>
      </Float>
      <Float speed={1.15} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[0.1, 1.15, -6]}>
          <torusGeometry args={[0.62, 0.16, 32, 96]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.45}
            chromaticAberration={0.08}
            anisotropy={0.2}
            distortion={0.15}
            distortionScale={0.25}
            temporalDistortion={0.12}
            iridescence={0.35}
            iridescenceIOR={1.2}
            color="#c4b5fd"
            transmission={0.85}
            roughness={0.18}
          />
        </mesh>
      </Float>
      <CompressedBrandMesh position={[0.2, -1.05, -4.6]} />
    </group>
  );
}

function PostStack() {
  const progress = useScrollProgress();
  const bloom = 0.32 + progress * 0.28;
  const aberration = 0.0007 + progress * 0.0016;
  const hue = -0.08 + progress * 0.16;

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={bloom}
        luminanceThreshold={0.16}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration offset={[aberration, aberration * 0.7]} />
      <HueSaturation hue={hue} saturation={0.08} />
      <Noise opacity={0.03} />
      <Vignette eskil={false} offset={0.16} darkness={0.66} />
    </EffectComposer>
  );
}

function SceneLights() {
  const key = useMemo(() => new Color("#22d3ee"), []);
  const fill = useMemo(() => new Color("#5E0ED7"), []);
  return (
    <>
      <ambientLight intensity={0.24} />
      <pointLight position={[4.2, 4, 4]} intensity={1.45} color={key} />
      <pointLight position={[-4.2, -2.2, 2]} intensity={1.05} color={fill} />
      <directionalLight position={[0, 6.5, 2.4]} intensity={0.4} color="#ddd6fe" />
    </>
  );
}

export default function AmbientScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      frameloop="always"
      camera={{ position: [0, 0, 3.55], fov: 46 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 5.5, 13.5]} />
      <SceneLights />
      <MouseLight />
      <Environment preset="city" />
      <Stars radius={95} depth={48} count={2200} factor={3.4} saturation={0.28} fade speed={0.32} />
      <Sparkles count={160} scale={[14, 9, 9]} size={2.1} speed={0.38} opacity={0.38} color="#67e8f9" />
      <ScrollInvalidator />
      <ScrollCameraRig />
      <BrandOrbs />
      <ContactShadows position={[0, -2.1, 0]} opacity={0.28} scale={18} blur={2.4} far={6} color="#020617" />
      <PostStack />
    </Canvas>
  );
}
