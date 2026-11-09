import type { MetadataRoute } from "next";
import { digitalServiceDetails } from "@/lib/digital-services";
import { energyServiceDetails } from "@/lib/energy-services";
import { guideArticles } from "@/lib/guide-articles";
import { logisticsServiceDetails } from "@/lib/logistics-services";
import { paymentServiceDetails } from "@/lib/payment-services";
import { phoneServiceDetails } from "@/lib/phone-services";
import { absoluteImageUrl, SITE_URL, isIndexablePath } from "@/lib/seo";
import { seoZones } from "@/lib/seo-zones";
import { webAgencyServiceDetails } from "@/lib/web-agency-services";
/* Sitemap callers: Next MetadataRoute. User: silo + URL nuove. */

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

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
    "/web-agency/lavori",
    "/consulenza",
    "/prenota",
    "/contatti",
    "/recensioni",
    "/lascia-un-feedback",
    "/prezzi",
    "/zone",
    "/guide",
    "/diritti-consumatore",
    "/cookie-policy",
    "/privacy-policy",
    "/deposito-bagagli",
    "/deposito-bagagli/i-miei-depositi",
    "/deposito-bagagli/verifica",
    "/fermo-deposito",
    "/fermo-deposito/i-miei-pacchi",
    "/send",
  ];

  const zoneRoutes = seoZones.map((zone) => `/zone/${zone.slug}`);
  const guideRoutes = guideArticles.map((article) => `/guide/${article.slug}`);

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
      ...zoneRoutes,
      ...guideRoutes,
      ...paymentRoutes,
      ...phoneRoutes,
      ...energyRoutes,
      ...logisticsRoutes,
      ...digitalRoutes,
      ...webAgencyRoutes,
    ]),
  ).filter((path) => isIndexablePath(path));

  return routes.map((path) => {
    const url = `${SITE_URL}${path}`;
    const isHome = path === "";
    const isService = path.startsWith("/servizi/");
    const isStrategicLeadPage =
      path === "/servizi" ||
      path === "/contatti" ||
      path === "/prenota" ||
      path === "/consulenza" ||
      path === "/web-agency";
    const isBrandPage = path === "/chi-siamo";
    const isTopLevel = !isService && path.split("/").length <= 2;

    const depositoPriority: Record<string, number> = {
      "/deposito-bagagli": 0.8,
      "/deposito-bagagli/i-miei-depositi": 0.5,
      "/deposito-bagagli/verifica": 0.3,
      "/fermo-deposito": 0.8,
      "/fermo-deposito/i-miei-pacchi": 0.5,
      "/send": 0.8,
    };

    return {
      url,
      lastModified: now,
      changeFrequency: isHome ? "weekly" : isStrategicLeadPage ? "weekly" : isBrandPage ? "monthly" : "monthly",
      priority: depositoPriority[path] != null
        ? depositoPriority[path]
        : isHome
          ? 1.0
          : isStrategicLeadPage
            ? 0.9
            : isBrandPage
              ? 0.8
              : isService
                ? 0.8
                : isTopLevel
                  ? 0.7
                  : 0.6,
      images: [absoluteImageUrl("/og-default.svg")],
      alternates: {
        languages: {
          "it-IT": url,
          "x-default": url,
        },
      },
    };
  });
}
