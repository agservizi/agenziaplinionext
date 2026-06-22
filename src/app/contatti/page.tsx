import ContattiContent from "@/components/ContattiContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Contatti AG SERVIZI | Castellammare di Stabia",
    description:
      "Scrivici su WhatsApp o vieni in Via Plinio il Vecchio 72. Rispondiamo entro l'ora. Consulenza gratuita.",
    path: "/contatti",
  });
}

export default function ContattiPage() {
  return (
    <>
      <ContattiContent />
      <FaqJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Contatti", href: "/contatti" }]} />
    </>
  );
}
