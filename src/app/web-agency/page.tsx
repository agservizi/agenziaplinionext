import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import WebAgencyShowcase from "@/components/WebAgencyShowcase";

export function generateMetadata() {
  return buildMetadata({
    title: "Web Agency creativa su misura a Castellammare di Stabia",
    description:
      "AG SERVIZI Web Agency: UI/UX, sviluppo e crescita digitale con uno stile creativo e ad alto impatto.",
    path: "/web-agency",
  });
}

export default function WebAgencyShowcasePage() {
  return (
    <>
      <WebAgencyShowcase />
      <BreadcrumbJsonLd items={[{ name: "Web Agency", href: "/web-agency" }]} />
    </>
  );
}
