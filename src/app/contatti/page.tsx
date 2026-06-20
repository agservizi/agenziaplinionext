import ContattiContent from "@/components/ContattiContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Contatti AG SERVIZI | Castellammare di Stabia",
    description:
      "Scrivici su WhatsApp o vieni in Via Plinio 72. Rispondiamo entro l'ora. Consulenza gratuita.",
    path: "/contatti",
  });
}

export default function ContattiPage() {
  return <ContattiContent />;
}
