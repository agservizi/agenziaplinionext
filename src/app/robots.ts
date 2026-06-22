import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/area-admin/",
          "/area-clienti/",
          "/evadi-pratica/",
          "/scarica-pratica/",
          "/checkout/",
          "/login",
          "/admin-login",
        ],
      },
      /* ── AI / LLM crawlers - accesso consentito (GEO ready) ── */
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "meta-externalagent",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
      {
        userAgent: "DuckAssistBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/evadi-pratica/", "/scarica-pratica/", "/checkout/"],
      },
    ],
    host: SITE_URL,
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/video-sitemap.xml`],
  };
}
