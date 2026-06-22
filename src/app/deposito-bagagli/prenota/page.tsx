import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PrenotaFlowClient from "./PrenotaFlowClient";

export function generateMetadata() {
  return buildMetadata({
    title: "Prenota deposito bagagli - AG SERVIZI",
    description:
      "Completa la prenotazione del deposito bagagli presso AG SERVIZI a Castellammare di Stabia.",
    path: "/deposito-bagagli/prenota",
    index: false,
  });
}

export default function PrenotaPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <PrenotaFlowClient />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: "Deposito Bagagli", href: "/deposito-bagagli" },
          { name: "Prenota", href: "/deposito-bagagli/prenota" },
        ]}
      />
    </>
  );
}
