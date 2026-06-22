import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import DepositDetailClient from "./DepositDetailClient";

export const revalidate = 0;

export function generateMetadata() {
  return buildMetadata({
    title: "Dettaglio deposito bagagli",
    description:
      "Visualizza i dettagli della tua prenotazione di deposito bagagli presso AG SERVIZI.",
    path: "/deposito-bagagli/deposito",
    index: false,
  });
}

export default async function DepositDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <DepositDetailClient code={code} />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: "Deposito Bagagli", href: "/deposito-bagagli" },
          { name: "Dettaglio", href: `/deposito-bagagli/deposito/${code}` },
        ]}
      />
    </>
  );
}
