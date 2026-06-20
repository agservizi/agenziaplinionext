import ChiSiamoContent from "@/components/ChiSiamoContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Chi siamo | AG SERVIZI Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia dal 2016. Persone vere, risposte rapide, niente call center.",
    path: "/chi-siamo",
  });
}

export default function ChiSiamoPage() {
  return <ChiSiamoContent />;
}
