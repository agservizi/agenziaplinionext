import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import VerificaClient from "./VerificaClient";

export function generateMetadata() {
  return buildMetadata({
    title: "Verifica deposito bagagli",
    description:
      "Verifica lo stato di un deposito bagagli tramite QR code presso AG SERVIZI.",
    path: "/deposito-bagagli/verifica",
    index: false,
  });
}

export default function VerificaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <p className="text-sm text-slate-500">Caricamento...</p>
        </div>
      }
    >
      <VerificaClient />
    </Suspense>
  );
}
