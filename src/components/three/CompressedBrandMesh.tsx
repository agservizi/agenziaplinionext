"use client";

import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  IcosahedronGeometry,
  type Mesh,
} from "three";
import { createGLTFLoader } from "@/lib/motion/loaders";

type CompressedBrandMeshProps = {
  position?: [number, number, number];
};

export default function CompressedBrandMesh({
  position = [0, 0, 0],
}: CompressedBrandMeshProps) {
  const mesh = useRef<Mesh>(null);
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function compress() {
      const [{ MeshoptEncoder }, { MeshoptDecoder }] = await Promise.all([
        import("meshoptimizer/encoder"),
        import("meshoptimizer/decoder"),
      ]);

      await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);

      const source = new IcosahedronGeometry(0.38, 2);
      const positionAttr = source.getAttribute("position");
      const vertexCount = positionAttr.count;
      const vertexBytes = new Uint8Array(positionAttr.array.buffer.slice(0));
      const encoded = MeshoptEncoder.encodeVertexBuffer(vertexBytes, vertexCount, 12);
      const decoded = new Uint8Array(vertexCount * 12);
      MeshoptDecoder.decodeVertexBuffer(decoded, vertexCount, 12, encoded);

      const next = new BufferGeometry();
      next.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(decoded.buffer), 3),
      );
      const index = source.getIndex();
      if (index) next.setIndex(index.clone());
      next.computeVertexNormals();
      source.dispose();

      if (!cancelled) setGeometry(next);
    }

    compress().catch(() => {
      if (!cancelled) setGeometry(new IcosahedronGeometry(0.38, 2));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void createGLTFLoader();
  }, []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.35;
    mesh.current.rotation.x += delta * 0.12;
  });

  if (!geometry) return null;

  return (
    <mesh ref={mesh} position={position} geometry={geometry}>
      <MeshDistortMaterial
        color="#67e8f9"
        emissive="#22d3ee"
        emissiveIntensity={0.4}
        roughness={0.22}
        metalness={0.5}
        distort={0.28}
        speed={1.4}
      />
    </mesh>
  );
}
