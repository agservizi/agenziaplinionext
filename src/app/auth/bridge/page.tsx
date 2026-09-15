import { Suspense } from "react";
import AuthBridgeClient from "@/components/auth/AuthBridgeClient";

export default async function AuthBridgePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; next?: string }>;
}) {
  const params = await searchParams;
  const kind = params.kind === "staff" ? "staff" : "customer";

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-white/70">
          Sicurezza sessione in corso…
        </div>
      }
    >
      <AuthBridgeClient kind={kind} />
    </Suspense>
  );
}
