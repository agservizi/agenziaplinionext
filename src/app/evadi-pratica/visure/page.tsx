import { Suspense } from "react";
import VisuraPracticeMagicLinkClient from "@/components/client-area/VisuraPracticeMagicLinkClient";

export default function EvadiVisuraPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            Sto aprendo la pratica visura...
          </div>
        </div>
      }
    >
      <VisuraPracticeMagicLinkClient />
    </Suspense>
  );
}
