import { Suspense } from "react";
import CafSignedDownloadClient from "@/components/client-area/CafSignedDownloadClient";

export default function ScaricaPraticaCafPatronatoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            Sto aprendo il download...
          </div>
        </div>
      }
    >
      <CafSignedDownloadClient />
    </Suspense>
  );
}
