import { Suspense } from "react";
import CafPracticeMagicLinkClient from "@/components/client-area/CafPracticeMagicLinkClient";

export default function EvadiCafPatronatoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            Sto aprendo la pratica...
          </div>
        </div>
      }
    >
      <CafPracticeMagicLinkClient />
    </Suspense>
  );
}
