"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearClientPortalToken,
  getClientPortalToken,
  validateClientPortalSession,
} from "@/lib/client-portal-auth";

export default function ClientPortalGuard({
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
      const token = getClientPortalToken();
      if (!token) {
        clearClientPortalToken();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const valid = await validateClientPortalSession(token);
      if (!active) return;

      if (!valid) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
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
            Accesso in corso
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Controllo il tuo accesso. Se la sessione non e valida ti riporto subito alla pagina di login.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
