"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { getScrollVelocity, subscribeScrollSnapshot } from "@/lib/motion/scroll-store";

export function ScrollInvalidator() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    return subscribeScrollSnapshot(() => invalidate());
  }, [invalidate]);

  return null;
}

export function ScrollCameraRig() {
  const { camera, pointer } = useThree();
  const progress = useScrollProgress();
  const target = useRef({ x: 0, y: 0, z: 3.55 });

  useFrame(() => {
    const velocity = getScrollVelocity();
    target.current.x = pointer.x * 0.45;
    target.current.y = pointer.y * 0.28 + Math.sin(progress * Math.PI) * 0.32;
    target.current.z = 3.45 + progress * 1.65 + Math.abs(velocity) * 0.08;

    camera.position.x += (target.current.x - camera.position.x) * 0.06;
    camera.position.y += (target.current.y - camera.position.y) * 0.06;
    camera.position.z += (target.current.z - camera.position.z) * 0.06;
    camera.rotation.z = (progress - 0.5) * 0.05 + velocity * 0.01;
    camera.lookAt(0, 0, -2);
  });

  return null;
}
