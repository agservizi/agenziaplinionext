export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine) and (min-width: 768px)").matches;
}

/** Desktop + no reduced motion → WebGL / Spline / Theatre allowed */
export function supportsImmersive3D(): boolean {
  if (typeof window === "undefined") return false;
  return supportsFinePointer() && !prefersReducedMotion();
}
