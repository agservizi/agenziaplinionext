"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getClientPortalToken,
  readClientPortalTokenPayload,
} from "@/lib/client-portal-auth";
import { safeNextPath } from "@/lib/auth/safe-next";

/** Callers: auth/bridge. User: CMS plan — staff bridge removed with legacy admin. */
export default function AuthBridgeClient({
  kind,
}: {
  kind: "customer" | "staff";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    if (kind === "staff") {
      router.replace("/");
      return;
    }
    const next = safeNextPath(searchParams.get("next"), "/area-clienti");
    const token = getClientPortalToken();

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const payload = readClientPortalTokenPayload();

    void (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            kind: "customer",
            token,
            username: payload?.username,
            userId: payload?.userId ?? null,
          }),
        });
        if (!res.ok) {
          setError("Sessione non valida. Accedi di nuovo.");
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        router.replace(next);
      } catch {
        setError("Impossibile sincronizzare la sessione.");
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      }
    })();
  }, [kind, router, searchParams]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-6 text-white">
      <p className="text-sm text-white/70">{error || "Sicurezza sessione in corso…"}</p>
    </div>
  );
}
