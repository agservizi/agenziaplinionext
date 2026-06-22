import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import RisultatiClient from "./RisultatiClient";

export function generateMetadata() {
  return buildMetadata({
    title: "Depositi bagagli disponibili a Castellammare di Stabia",
    description:
      "Trova il deposito bagagli piu vicino a Castellammare di Stabia. Prenota online, deposita in agenzia.",
    path: "/deposito-bagagli/risultati",
    index: false,
  });
}

export default function RisultatiPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <RisultatiClient />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: "Deposito Bagagli", href: "/deposito-bagagli" },
          { name: "Risultati", href: "/deposito-bagagli/risultati" },
        ]}
      />
    </>
  );
}
