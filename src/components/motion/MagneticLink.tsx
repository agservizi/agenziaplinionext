"use client";

import { Link } from "next-view-transitions";
import { type ComponentProps, type MouseEvent, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";

type MagneticLinkProps = ComponentProps<typeof Link> & {
  strength?: number;
};

export function MagneticLink({
  href,
  onClick,
  strength = 14,
  onMouseMove,
  onMouseLeave,
  ...rest
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (typeof href === "string" && href.startsWith("/")) {
      window.dispatchEvent(new CustomEvent("ag-page-transition-start"));
    }
  }

  function handleMove(event: MouseEvent<HTMLAnchorElement>) {
    onMouseMove?.(event);
    const node = ref.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * strength;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * strength;
    gsap.to(node, { x, y, duration: 0.35, ease: "agCinematic", overwrite: "auto" });
  }

  function handleLeave(event: MouseEvent<HTMLAnchorElement>) {
    onMouseLeave?.(event);
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.55, ease: "agExpo" });
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    />
  );
}

export { Link as TransitionLink };
