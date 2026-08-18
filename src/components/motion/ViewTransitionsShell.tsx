"use client";

import { ViewTransitions } from "next-view-transitions";
import { type ReactNode } from "react";

export default function ViewTransitionsShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransitions>
      <div className="view-transition-root">{children}</div>
    </ViewTransitions>
  );
}
