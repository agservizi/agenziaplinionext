import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/chi-siamo",
    "/servizi",
    "/servizi/pagamenti",
    "/servizi/telefonia",
    "/servizi/energia",
    "/servizi/spid-pec-firma-digitale",
    "/servizi/web-agency",
    "/store",
    "/contatti",
    "/cookie-policy",
    "/privacy-policy",
  ];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
