import { buildMetadata } from "@/lib/seo";
import WebAgencyShowcase from "@/components/WebAgencyShowcase";

export function generateMetadata() {
  return buildMetadata({
    title: "Web Agency creativa su misura",
    description:
      "AG SERVIZI Web Agency: UI/UX, sviluppo e crescita digitale con uno stile creativo e ad alto impatto.",
    path: "/web-agency",
  });
}

export default function WebAgencyShowcasePage() {
  return <WebAgencyShowcase />;
}
