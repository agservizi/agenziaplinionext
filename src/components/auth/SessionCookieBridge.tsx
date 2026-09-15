"use client";

import { useEffect } from "react";
import {
  CLIENT_PORTAL_TOKEN_KEY,
  getClientPortalToken,
  readClientPortalTokenPayload,
} from "@/lib/client-portal-auth";
import {
  ADMIN_PORTAL_TOKEN_KEY,
  getAdminPortalToken,
} from "@/lib/admin-portal-auth";

/**
 * Bridges legacy localStorage portal tokens into httpOnly cookies (dual-read cutover).
 */
export default function SessionCookieBridge({
  kind,
}: {
  kind: "customer" | "staff";
}) {
  useEffect(() => {
    const token =
      kind === "customer" ? getClientPortalToken() : getAdminPortalToken();
    if (!token) return;

    const payload = kind === "customer" ? readClientPortalTokenPayload() : null;

    void fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        kind,
        token,
        username: payload?.username,
        userId: payload?.userId ?? null,
      }),
    }).catch(() => {
      /* ignore — middleware will redirect if sync fails */
    });
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

  useEffect(() => {
    if (kind !== "staff") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== ADMIN_PORTAL_TOKEN_KEY) return;
      if (!event.newValue) {
        void fetch("/api/auth/session?kind=staff", { method: "DELETE" });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [kind]);

  return null;
}
