import PrenotaContent from "@/components/PrenotaContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Prenota un appuntamento | AG SERVIZI Castellammare di Stabia",
    description: "Prenota un appuntamento in sede AG SERVIZI a Castellammare di Stabia. Telefonia, energia, SPID, PEC, spedizioni e consulenze. Via Plinio il Vecchio 72.",
    path: "/prenota",
  });
}

export default function PrenotaPage() {
  return (
    <>
      <PrenotaContent />
      <BreadcrumbJsonLd items={[{ name: "Prenota", href: "/prenota" }]} />
    </>
  );
}
