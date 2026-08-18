"use client";

export default function ScrollProgress() {
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-9999 h-[3px] origin-left"
      style={{
        width: "100%",
        transform: "scaleX(var(--ag-scroll, 0))",
        backgroundImage: "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee)",
      }}
      aria-hidden="true"
    />
  );
}
