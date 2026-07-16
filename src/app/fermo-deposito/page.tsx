import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FermoDepositoClient from "./FermoDepositoClient";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Fermo deposito pacchi a Castellammare di Stabia",
    description:
      "Prenota il fermo deposito pacchi presso AG SERVIZI. Da 0,50€ al giorno, codice LP e ritiro in Via Plinio il Vecchio 72.",
    path: "/fermo-deposito",
    keywords: [
      "fermo deposito pacchi",
      "locker point castellammare",
      "custodia pacchi",
      "ritiro pacchi agenzia",
    ],
  });
}

export default function FermoDepositoPage() {
  return (
    <>
      <FermoDepositoClient />
      <BreadcrumbJsonLd
        items={[{ name: "Fermo deposito", href: "/fermo-deposito" }]}
      />
    </>
  );
}
