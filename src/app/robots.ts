import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/", "/login", "/admin-login"],
      },
      /* ── AI / LLM crawlers - accesso consentito (GEO ready) ── */
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/api/", "/area-admin/", "/area-clienti/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
