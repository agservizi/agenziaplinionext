import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PackageDetailClient from "./PackageDetailClient";

export const revalidate = 0;

export function generateMetadata() {
  return buildMetadata({
    title: "Dettaglio fermo deposito",
    description:
      "Visualizza i dettagli del tuo pacco in fermo deposito presso AG SERVIZI.",
    path: "/fermo-deposito/pacco",
    index: false,
  });
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <PackageDetailClient code={code} />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: "Fermo deposito", href: "/fermo-deposito" },
          { name: "Dettaglio pacco", href: `/fermo-deposito/pacco/${code}` },
        ]}
      />
    </>
  );
}
