import ChiSiamoContent from "@/components/ChiSiamoContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Chi siamo | AG SERVIZI Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia dal 2016. Persone vere, risposte rapide, niente call center.",
    path: "/chi-siamo",
  });
}

export default function ChiSiamoPage() {
  return (
    <>
      <ChiSiamoContent />
      <BreadcrumbJsonLd items={[{ name: "Chi siamo", href: "/chi-siamo" }]} />
    </>
  );
}
