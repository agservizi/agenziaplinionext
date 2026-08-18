import {
  Flip,
  gsap,
  Observer,
  ScrollTrigger,
  SplitText,
} from "@/lib/motion/gsap";
import {
  applyScrollCssVars,
  dispatchMotionReady,
  setScrollProgress,
} from "@/lib/motion/scroll-store";

function splitWithPlugin(element: HTMLElement, type: "words" | "chars") {
  if (element.dataset.gsapSplitDone === "1") {
    return Array.from(
      element.querySelectorAll<HTMLElement>(
        type === "chars" ? ".gsap-split-char" : ".gsap-split-word-inner",
      ),
    );
  }

  const original = element.textContent?.trim() ?? "";
  if (!original) return [];

  element.dataset.gsapSplitDone = "1";
  element.setAttribute("aria-label", original);

  try {
    const split = SplitText.create(element, {
      type,
      wordsClass: "gsap-split-word-inner",
      charsClass: "gsap-split-char",
      aria: "hidden",
    });
    return (type === "chars" ? split.chars : split.words) as HTMLElement[];
  } catch {
    return fallbackSplit(element, original, type);
  }
}

function fallbackSplit(element: HTMLElement, original: string, type: "words" | "chars") {
  if (type === "chars") {
    element.innerHTML = original
      .split("")
      .map((char) =>
        char === " "
          ? `<span class="inline-block w-[0.28em]" aria-hidden="true">&nbsp;</span>`
          : `<span class="gsap-split-char inline-block will-change-transform">${char}</span>`,
      )
      .join("");
    return Array.from(element.querySelectorAll<HTMLElement>(".gsap-split-char"));
  }

  element.innerHTML = original
    .split(/\s+/)
    .map(
      (word) =>
        `<span class="gsap-split-word inline-block overflow-hidden align-top"><span class="gsap-split-word-inner inline-block will-change-transform">${word}</span></span>`,
    )
    .join('<span class="inline-block w-[0.28em]" aria-hidden="true">&nbsp;</span>');
  return Array.from(element.querySelectorAll<HTMLElement>(".gsap-split-word-inner"));
}

export function mountScrollOrchestrator() {
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      setScrollProgress(self.progress);
      applyScrollCssVars();
    },
  });

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]").forEach((element, index) => {
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 64, filter: "blur(14px)", rotateX: 10 },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          rotateX: 0,
          duration: 1.15,
          delay: Math.min(index * 0.04, 0.24),
          ease: "agExpo",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
    });

    ScrollTrigger.batch("[data-gsap-stagger] [data-gsap-stagger-item]", {
      start: "top 82%",
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { autoAlpha: 0, y: 48, scale: 0.94, rotateX: 8 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: { amount: 0.5, from: "start" },
            ease: "agCinematic",
          },
        );
      },
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-text-split]").forEach((element) => {
      const words = splitWithPlugin(element, "words");
      if (!words.length) return;
      gsap.fromTo(
        words,
        { yPercent: 120, autoAlpha: 0, rotate: 4 },
        {
          yPercent: 0,
          autoAlpha: 1,
          rotate: 0,
          duration: 0.95,
          stagger: 0.04,
          ease: "agExpo",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-chars]").forEach((element) => {
      const chars = splitWithPlugin(element, "chars");
      if (!chars.length) return;
      gsap.fromTo(
        chars,
        { yPercent: 110, autoAlpha: 0, rotateX: 70 },
        {
          yPercent: 0,
          autoAlpha: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.018,
          ease: "agExpo",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            once: true,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-clip]").forEach((element) => {
      gsap.fromTo(
        element,
        { clipPath: "inset(12% 18% 12% 18% round 28px)", scale: 1.08 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "top 20%",
            scrub: 1.1,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-scale]").forEach((element) => {
      gsap.fromTo(
        element,
        { autoAlpha: 0, scale: 0.86, rotateY: -8 },
        {
          autoAlpha: 1,
          scale: 1,
          rotateY: 0,
          duration: 0.9,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]").forEach((element) => {
      const distance = Number(element.dataset.gsapParallax || 110);
      gsap.fromTo(
        element,
        { y: -distance * 0.45 },
        {
          y: distance * 0.45,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.35,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-scrub]").forEach((element) => {
      const targets = element.querySelectorAll<HTMLElement>("[data-gsap-scrub-item]");
      if (!targets.length) return;
      gsap.fromTo(
        targets,
        { y: 96, autoAlpha: 0.25, scale: 0.92 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: element,
            start: "top 75%",
            end: "bottom 35%",
            scrub: 1.5,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-count]").forEach((element) => {
      const target = Number(element.dataset.gsapCount || 0);
      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: target,
        duration: 1.8,
        ease: "agExpo",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          element.textContent = String(Math.round(proxy.value));
        },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-skew]").forEach((element) => {
      const proxy = { skew: 0 };
      ScrollTrigger.create({
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const next = gsap.utils.clamp(-8, 8, self.getVelocity() / 380);
          proxy.skew = gsap.utils.interpolate(proxy.skew, next, 0.18);
          gsap.set(element, { skewY: proxy.skew, force3D: true });
        },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-magnetic]").forEach((element) => {
      const strength = Number(element.dataset.gsapMagnetic || 18);
      Observer.create({
        target: element,
        type: "pointer",
        onMove: (self) => {
          const bounds = element.getBoundingClientRect();
          const x = ((self.x ?? 0) - bounds.left) / bounds.width - 0.5;
          const y = ((self.y ?? 0) - bounds.top) / bounds.height - 0.5;
          gsap.to(element, {
            x: x * strength,
            y: y * strength,
            duration: 0.45,
            ease: "agCinematic",
            overwrite: "auto",
          });
        },
        onStop: () => {
          gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: "agExpo" });
        },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-draw]").forEach((element) => {
      const paths = element.querySelectorAll("path, line, polyline, circle");
      if (!paths.length) return;
      gsap.fromTo(
        paths,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 1.6,
          stagger: 0.12,
          ease: "agCinematic",
          scrollTrigger: {
            trigger: element,
            start: "top 78%",
            once: true,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-marquee]").forEach((element) => {
      const track = element.querySelector<HTMLElement>("[data-gsap-marquee-track]");
      if (!track) return;
      const distance = track.scrollWidth / 2;
      gsap.to(track, {
        x: -distance,
        duration: Number(element.dataset.gsapMarquee || 28),
        ease: "none",
        repeat: -1,
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-scramble]").forEach((element) => {
      const original = element.textContent?.trim() ?? "";
      if (!original) return;
      element.addEventListener("mouseenter", () => {
        gsap.to(element, {
          duration: 0.7,
          scrambleText: { text: original, chars: "upperCase", speed: 0.6 },
          ease: "none",
        });
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-progress]").forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          element.style.setProperty("--st-progress", self.progress.toFixed(4));
        },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-gsap-pin]").forEach((element) => {
      const pinTarget =
        element.querySelector<HTMLElement>("[data-gsap-pin-target]") || element;
      const end = element.dataset.gsapPinEnd || "+=140%";

      ScrollTrigger.create({
        trigger: element,
        start: "top top+=88",
        end,
        pin: pinTarget,
        pinSpacing: true,
        anticipatePin: 1,
      });

      gsap.utils
        .toArray<HTMLElement>(element.querySelectorAll("[data-gsap-pin-fade]"))
        .forEach((target) => {
          gsap.fromTo(
            target,
            { autoAlpha: 1, y: 0 },
            {
              autoAlpha: 0,
              y: -56,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top top+=88",
                end,
                scrub: 1,
              },
            },
          );
        });
    });
  });

  mm.add(
    "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
    () => {
      gsap.utils.toArray<HTMLElement>("[data-gsap-hero]").forEach((element) => {
        const media = element.querySelector<HTMLElement>("[data-gsap-hero-media]");
        const veil = element.querySelector<HTMLElement>("[data-gsap-hero-veil]");
        ScrollTrigger.create({
          trigger: element,
          start: "top top",
          end: "+=90%",
          pin: true,
          anticipatePin: 1,
        });
        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.18, yPercent: 0 },
            {
              scale: 1,
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top top",
                end: "+=90%",
                scrub: 1.1,
              },
            },
          );
        }
        if (veil) {
          gsap.fromTo(
            veil,
            { autoAlpha: 0.35 },
            {
              autoAlpha: 0.82,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top top",
                end: "+=90%",
                scrub: true,
              },
            },
          );
        }
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-stack]").forEach((element) => {
        const items = element.querySelectorAll<HTMLElement>("[data-gsap-stack-item]");
        const copies = element.querySelectorAll<HTMLElement>("[data-gsap-stack-copy]");
        if (items.length < 2) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top top",
            end: `+=${items.length * 90}%`,
            pin: true,
            scrub: 1.15,
            anticipatePin: 1,
          },
        });

        items.forEach((item, index) => {
          gsap.set(item, { autoAlpha: index === 0 ? 1 : 0, yPercent: index === 0 ? 0 : 28 });
        });
        copies.forEach((copy, index) => {
          gsap.set(copy, { autoAlpha: index === 0 ? 1 : 0 });
        });

        items.forEach((item, index) => {
          if (index === 0) return;
          tl.to(items[index - 1], { autoAlpha: 0, yPercent: -24, ease: "none" }, index - 1);
          tl.to(item, { autoAlpha: 1, yPercent: 0, ease: "none" }, index - 1);
          if (copies[index - 1] && copies[index]) {
            tl.to(copies[index - 1], { autoAlpha: 0, ease: "none" }, index - 1);
            tl.to(copies[index], { autoAlpha: 1, ease: "none" }, index - 1);
          }
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-horizontal]").forEach((track) => {
        const panels = track.querySelectorAll<HTMLElement>("[data-gsap-horizontal-panel]");
        if (panels.length < 2) return;

        gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: track,
            pin: true,
            scrub: 1.05,
            snap: 1 / (panels.length - 1),
            anticipatePin: 1,
            end: () => `+=${Math.max(track.offsetWidth, window.innerWidth) * (panels.length - 0.35)}`,
          },
        });
      });
    },
  );

  return () => {
    Observer.getAll().forEach((observer) => observer.kill());
    mm.revert();
  };
}

export function captureViewFlip() {
  return Flip.getState("[data-flip-share], [data-gsap-flip]");
}

export function playViewFlip(state: ReturnType<typeof Flip.getState>) {
  Flip.from(state, {
    duration: 0.7,
    ease: "agCinematic",
    absolute: true,
    nested: true,
    prune: true,
  });
}

export function refreshScrollMotion() {
  ScrollTrigger.refresh();
  dispatchMotionReady();
}
