import PrenotaContent from "@/components/PrenotaContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Prenota un appuntamento | AG SERVIZI Castellammare di Stabia",
    description: "Prenota un appuntamento in sede AG SERVIZI a Castellammare di Stabia. Telefonia, energia, SPID, PEC, spedizioni e consulenze. Via Plinio il Vecchio 72.",
    path: "/prenota",
  });
}

export default function PrenotaPage() {
  return <PrenotaContent />;
}
