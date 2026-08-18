"use client";

import { Link } from "next-view-transitions";
import { type ComponentProps, type MouseEvent } from "react";

type MagneticLinkProps = ComponentProps<typeof Link>;

export function MagneticLink({ href, onClick, ...rest }: MagneticLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (typeof href === "string" && href.startsWith("/")) {
      window.dispatchEvent(new CustomEvent("ag-page-transition-start"));
    }
  }

  return <Link href={href} onClick={handleClick} {...rest} />;
}

export { Link as TransitionLink };
