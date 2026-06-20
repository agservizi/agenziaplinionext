import type { MetadataRoute } from "next";
import { digitalServiceDetails } from "@/lib/digital-services";
import { energyServiceDetails } from "@/lib/energy-services";
import { logisticsServiceDetails } from "@/lib/logistics-services";
import { paymentServiceDetails } from "@/lib/payment-services";
import { phoneServiceDetails } from "@/lib/phone-services";
import { absoluteImageUrl, SITE_URL, isIndexablePath } from "@/lib/seo";
import { webAgencyServiceDetails } from "@/lib/web-agency-services";

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

    return {
      url,
      lastModified: now,
      changeFrequency: isHome ? "weekly" : isStrategicLeadPage ? "weekly" : isBrandPage ? "monthly" : "monthly",
      priority: isHome
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
