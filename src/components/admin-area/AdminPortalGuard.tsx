"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAdminPortalToken,
  getAdminPortalToken,
  validateAdminPortalSession,
} from "@/lib/admin-portal-auth";

export default function AdminPortalGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const token = getAdminPortalToken();
      if (!token) {
        clearAdminPortalToken();
        router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const valid = await validateAdminPortalSession(token);
      if (!active) return;

      if (!valid) {
        router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setStatus("allowed");
    };

    run();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (status !== "allowed") {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
        <div className="glass-card rounded-4xl p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Controllo sessione
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Sto controllando la sessione interna. Se non e valida torno subito al login admin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
