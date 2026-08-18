type ScrollSnapshot = {
  progress: number;
  velocity: number;
  direction: 1 | -1 | 0;
};

type ScrollListener = (snapshot: ScrollSnapshot) => void;

let snapshot: ScrollSnapshot = {
  progress: 0,
  velocity: 0,
  direction: 0,
};

const listeners = new Set<ScrollListener>();

function emit() {
  listeners.forEach((listener) => listener(snapshot));
}

export function setScrollProgress(progress: number) {
  const next = Math.max(0, Math.min(1, progress));
  if (next === snapshot.progress) return;
  snapshot = { ...snapshot, progress: next };
  emit();
}

export function setScrollKinematics(velocity: number, direction: 1 | -1 | 0) {
  if (velocity === snapshot.velocity && direction === snapshot.direction) return;
  snapshot = { ...snapshot, velocity, direction };
  emit();
}

export function getScrollProgress() {
  return snapshot.progress;
}

export function getScrollVelocity() {
  return snapshot.velocity;
}

export function getScrollSnapshot() {
  return snapshot;
}

export function subscribeScrollProgress(listener: (progress: number) => void) {
  const wrapped: ScrollListener = (next) => listener(next.progress);
  listeners.add(wrapped);
  listener(snapshot.progress);
  return () => {
    listeners.delete(wrapped);
  };
}

export function subscribeScrollSnapshot(listener: ScrollListener) {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

export function dispatchMotionReady() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ag-motion-ready"));
}

export function applyScrollCssVars() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--ag-scroll", snapshot.progress.toFixed(4));
  root.style.setProperty("--ag-velocity", snapshot.velocity.toFixed(3));
  root.style.setProperty("--ag-direction", String(snapshot.direction));
}
