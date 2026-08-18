import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PackagesListClient from "./PackagesListClient";

export const revalidate = 0;

export function generateMetadata() {
  return buildMetadata({
    title: "I miei pacchi — fermo deposito",
    description:
      "Consulta le prenotazioni fermo deposito pacchi presso AG SERVIZI con email, telefono o codice LP.",
    path: "/fermo-deposito/i-miei-pacchi",
    index: false,
  });
}

export default function MyPackagesPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <PackagesListClient />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: "Fermo deposito", href: "/fermo-deposito" },
          { name: "I miei pacchi", href: "/fermo-deposito/i-miei-pacchi" },
        ]}
      />
    </>
  );
}
