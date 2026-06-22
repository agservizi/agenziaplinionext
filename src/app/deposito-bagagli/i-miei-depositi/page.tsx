import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import DepositsListClient from "./DepositsListClient";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "I miei depositi bagagli",
    description:
      "Controlla lo stato delle tue prenotazioni di deposito bagagli presso AG SERVIZI a Castellammare di Stabia.",
    path: "/deposito-bagagli/i-miei-depositi",
  });
}

export default function IMieiDepositiPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <DepositsListClient />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: "Deposito Bagagli", href: "/deposito-bagagli" },
          { name: "I miei depositi", href: "/deposito-bagagli/i-miei-depositi" },
        ]}
      />
    </>
  );
}
