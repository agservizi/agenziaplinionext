import ConsulenzaContent from "@/components/ConsulenzaContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Consulenza Interattiva a Castellammare di Stabia | AG SERVIZI",
    description:
      "Richiedi una consulenza interattiva per tutti i servizi AG SERVIZI e ricevi codice pratica via email.",
    path: "/consulenza",
  });
}

export default function ConsulenzaPage() {
  return <ConsulenzaContent />;
}
