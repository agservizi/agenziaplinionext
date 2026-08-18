"use client";

import MotionProvider from "@/components/motion/MotionProvider";
import { type ReactNode } from "react";

/** @deprecated Use MotionProvider directly — kept for backward compatibility */
export default function MotionOrchestrator({ children }: { children: ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
