import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { applyScrollCssVars, setScrollKinematics } from "@/lib/motion/scroll-store";

export type LenisHandle = {
  lenis: Lenis;
  destroy: () => void;
};

export function createLenisBridge(): LenisHandle | null {
  if (typeof window === "undefined") return null;

  const lenis = new Lenis({
    anchors: true,
    autoRaf: false,
    lerp: 0.062,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.82,
    touchMultiplier: 1.05,
  });

  document.documentElement.classList.add("lenis", "lenis-smooth");

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length && typeof value === "number") {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.documentElement.style.transform ? "transform" : "fixed",
  });

  lenis.on("scroll", () => {
    ScrollTrigger.update();
    const velocity = Math.max(-4, Math.min(4, lenis.velocity ?? 0));
    const direction = velocity > 0.08 ? 1 : velocity < -0.08 ? -1 : 0;
    setScrollKinematics(velocity, direction);
    applyScrollCssVars();
  });

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const onRefresh = () => lenis.resize();
  ScrollTrigger.addEventListener("refresh", onRefresh);

  const stopOnTransition = () => lenis.stop();
  const startOnTransition = () => lenis.start();
  window.addEventListener("ag-page-transition-start", stopOnTransition);
  window.addEventListener("ag-motion-ready", startOnTransition);

  return {
    lenis,
    destroy() {
      window.removeEventListener("ag-page-transition-start", stopOnTransition);
      window.removeEventListener("ag-motion-ready", startOnTransition);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
      ScrollTrigger.scrollerProxy(document.documentElement, {});
    },
  };
}
