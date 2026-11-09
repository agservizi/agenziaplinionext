"use client";

import type { ComponentProps } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MenuToggleIconProps = ComponentProps<"svg"> & {
  open: boolean;
  duration?: number;
};

/** 21st.dev Menu Toggle Icon (efferd), restyled for Brutal Editorial. */
export function MenuToggleIcon({
  open,
  className,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2.5,
  strokeLinecap = "square",
  strokeLinejoin = "miter",
  duration = 420,
  ...props
}: MenuToggleIconProps) {
  const reduced = useReducedMotion();
  const ms = reduced ? 0 : duration;

  return (
    <svg
      strokeWidth={strokeWidth}
      fill={fill}
      stroke={stroke}
      viewBox="0 0 32 32"
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      aria-hidden="true"
      className={cn("transition-transform ease-in-out", open && "-rotate-45", className)}
      style={{ transitionDuration: `${ms}ms` }}
      {...props}
    >
      <path
        className={cn(
          "transition-all ease-in-out",
          open
            ? "[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]"
            : "[stroke-dasharray:12_63]",
        )}
        style={{ transitionDuration: `${ms}ms` }}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </svg>
  );
}
