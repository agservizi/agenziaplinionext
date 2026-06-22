import ServiziContent from "@/components/ServiziContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Servizi a Castellammare di Stabia",
    description:
      "Telefonia, energia, SPID, PEC, spedizioni, CAF, pagamenti e web agency. Tutto da AG SERVIZI a Castellammare di Stabia.",
    path: "/servizi",
  });
}

export default function ServiziPage() {
  return (
    <>
      <ServiziContent />
      <BreadcrumbJsonLd items={[{ name: "Servizi", href: "/servizi" }]} />
    </>
  );
}
