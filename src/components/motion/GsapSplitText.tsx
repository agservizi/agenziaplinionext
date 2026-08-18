"use client";

import type { HTMLAttributes, ReactNode } from "react";

type GsapSplitTextProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  chars?: boolean;
};

/** Heading copy animated word-by-word via GSAP ScrollTrigger in MotionProvider */
export function GsapSplitText({
  as = "h2",
  children,
  className = "",
  chars = false,
  ...rest
}: GsapSplitTextProps) {
  const Tag = as;
  return (
    <Tag
      className={className}
      data-gsap-text-split={chars ? undefined : true}
      data-gsap-chars={chars ? true : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
