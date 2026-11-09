import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import WebAgencyLavoriPage from "@/components/web-agency/WebAgencyLavoriPage";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({
    title: "Lavori Web Agency | Portfolio progetti AG SERVIZI",
    description:
      "Portfolio Web Agency AG SERVIZI: landing, siti vetrina, e-commerce e piattaforme realizzate a Castellammare di Stabia.",
    path: "/web-agency/lavori",
  });
}

export default function WebAgencyLavoriIndexPage() {
  return (
    <>
      <WebAgencyLavoriPage />
      <BreadcrumbJsonLd
        items={[
          { name: "Web Agency", href: "/web-agency" },
          { name: "Lavori", href: "/web-agency/lavori" },
        ]}
      />
    </>
  );
}
