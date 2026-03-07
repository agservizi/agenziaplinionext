import type { MetadataRoute } from "next";
import { digitalServiceDetails } from "@/lib/digital-services";
import { energyServiceDetails } from "@/lib/energy-services";
import { logisticsServiceDetails } from "@/lib/logistics-services";
import { paymentServiceDetails } from "@/lib/payment-services";
import { phoneServiceDetails } from "@/lib/phone-services";
import { SITE_URL, isIndexablePath } from "@/lib/seo";
import { webAgencyServiceDetails } from "@/lib/web-agency-services";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/chi-siamo",
    "/servizi",
    "/servizi/pagamenti",
    "/servizi/telefonia",
    "/servizi/energia",
    "/servizi/logistica",
    "/servizi/digitali",
    "/servizi/web-agency",
    "/servizi/spid-pec-firma-digitale",
    "/web-agency",
    "/servizi/web-agency",
    "/consulenza",
    "/prenota",
    "/contatti",
    "/cookie-policy",
    "/privacy-policy",
  ];

  const paymentRoutes = paymentServiceDetails.map(
    (service) => `/servizi/pagamenti/${service.slug}`,
  );
  const phoneRoutes = phoneServiceDetails.map(
    (service) => `/servizi/telefonia/${service.slug}`,
  );
  const energyRoutes = energyServiceDetails.map(
    (service) => `/servizi/energia/${service.slug}`,
  );
  const logisticsRoutes = logisticsServiceDetails.map(
    (service) => `/servizi/logistica/${service.slug}`,
  );
  const digitalRoutes = digitalServiceDetails.map(
    (service) => `/servizi/digitali/${service.slug}`,
  );
  const webAgencyRoutes = webAgencyServiceDetails.map(
    (service) => `/servizi/web-agency/${service.slug}`,
  );

  const routes = Array.from(
    new Set([
      ...publicRoutes,
      ...paymentRoutes,
      ...phoneRoutes,
      ...energyRoutes,
      ...logisticsRoutes,
      ...digitalRoutes,
      ...webAgencyRoutes,
    ]),
  ).filter((path) => isIndexablePath(path));

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/servizi/") ? 0.8 : 0.7,
  }));
}
