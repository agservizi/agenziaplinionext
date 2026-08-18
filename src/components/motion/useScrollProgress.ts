"use client";

import { useEffect, useState } from "react";
import {
  getScrollProgress,
  subscribeScrollProgress,
} from "@/lib/motion/scroll-store";

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(getScrollProgress());
    return subscribeScrollProgress(setProgress);
  }, []);

  return progress;
}
