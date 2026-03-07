import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { paymentServiceDetails } from "@/lib/payment-services";
import { phoneServiceDetails } from "@/lib/phone-services";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/area-clienti",
    "/area-clienti/spedizioni",
    "/area-clienti/visure",
    "/area-clienti/visure/storico",
    "/area-clienti/fotocopie",
    "/area-clienti/fotocopie/conferma-pagamento",
    "/area-clienti/ticket-pratiche-documenti",
    "/area-clienti/caf-patronato",
    "/area-clienti/caf-patronato/conferma-pagamento",
    "/area-clienti/caf-patronato/storico",
    "/chi-siamo",
    "/servizi",
    "/servizi/pagamenti",
    "/servizi/telefonia",
    "/servizi/energia",
    "/servizi/spid-pec-firma-digitale",
    "/servizi/web-agency",
    "/consulenza",
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

  return [...routes, ...paymentRoutes, ...phoneRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
