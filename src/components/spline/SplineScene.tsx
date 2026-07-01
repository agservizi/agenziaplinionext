"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineFallback state="loading" />,
});

const DEFAULT_SCENE = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";

function SplineFallback({ state = "idle" }: { state?: "idle" | "loading" }) {
  return (
    <div className="spline-fallback relative h-full min-h-[220px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_74%_68%,rgba(94,14,215,0.28),transparent_36%)]" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[2.1rem] border border-cyan-200/20 bg-white/8 shadow-[0_30px_90px_rgba(34,211,238,0.18)] motion-safe:animate-[heroBreathe_4.8s_ease-in-out_infinite]" />
      <div className="absolute left-[18%] top-[22%] h-10 w-10 rounded-full border border-white/15 bg-cyan-300/18 motion-safe:animate-[heroFloat_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-[18%] right-[16%] h-14 w-14 rounded-2xl border border-white/12 bg-violet-400/16 motion-safe:animate-[heroFloat_7s_ease-in-out_infinite_0.4s]" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          {state === "loading" ? "Caricamento scena 3D" : "Esperienza 3D ottimizzata"}
        </p>
      </div>
    </div>
  );
}

export default function SplineScene({
  className = "",
  scene,
}: {
  className?: string;
  scene?: string;
}) {
  const [canRenderSpline, setCanRenderSpline] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sceneUrl = useMemo(
    () => scene || process.env.NEXT_PUBLIC_SPLINE_HOME_SCENE || DEFAULT_SCENE,
    [scene],
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setCanRenderSpline(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {!canRenderSpline ? <SplineFallback /> : null}
      {canRenderSpline ? (
        <div className="relative h-full min-h-[220px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80">
          {!loaded ? <div className="absolute inset-0"><SplineFallback state="loading" /></div> : null}
          <Spline
            scene={sceneUrl}
            renderOnDemand
            onLoad={() => setLoaded(true)}
            className={`h-full min-h-[220px] w-full transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-slate-950/80 to-transparent" />
        </div>
      ) : null}
    </div>
  );
}