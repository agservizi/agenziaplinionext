"use client";

import { useEffect } from "react";
import {
  CLIENT_PORTAL_TOKEN_KEY,
  getClientPortalToken,
  readClientPortalTokenPayload,
} from "@/lib/client-portal-auth";

/** Callers: area-clienti layout. User: CMS plan — staff SessionCookieBridge removed. */
export default function SessionCookieBridge({
  kind,
}: {
  kind: "customer" | "staff";
}) {
  useEffect(() => {
    if (kind !== "customer") return;
    const token = getClientPortalToken();
    if (!token) return;
    const payload = readClientPortalTokenPayload();
    void fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        kind: "customer",
        token,
        username: payload?.username,
        userId: payload?.userId ?? null,
      }),
    }).catch(() => {});
  }, [kind]);

  useEffect(() => {
    if (kind !== "customer") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CLIENT_PORTAL_TOKEN_KEY) return;
      if (!event.newValue) {
        void fetch("/api/auth/session?kind=customer", { method: "DELETE" });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [kind]);

  return null;
}
