import type { NextConfig } from "next";
import path from "node:path";

const staticExportEnabled =
  String(process.env.NEXT_STATIC_EXPORT || "false").trim().toLowerCase() === "true";
const localPhpApiOrigin = process.env.LOCAL_PHP_API_ORIGIN || "http://localhost:8089";

const nextConfig: NextConfig = {
  ...(staticExportEnabled ? { output: "export" as const } : {}),
  trailingSlash: staticExportEnabled,
  serverExternalPackages: ["mysql2", "resend"],
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
    "@splinetool/react-spline",
    "@splinetool/runtime",
  ],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@iconify/react",
      "@react-three/drei",
      "lottie-react",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    if (staticExportEnabled) {
      return [];
    }

    // Callers: Next rewrites. Affects public static demos under /demos/*.
    // User: "le demo in /web-agency/lavori al clic su apri demo live non portano a nulla"
    return [
      {
        source: "/demos/:slug",
        destination: "/demos/:slug/index.html",
      },
      {
        source: "/demos/:slug/",
        destination: "/demos/:slug/index.html",
      },
      {
        source: "/api/public/plinio-assistant",
        destination: `${localPhpApiOrigin}/api/public/plinio-assistant.php`,
      },
      {
        source: "/api/client-area/requests",
        destination: `${localPhpApiOrigin}/api/client-area/requests.php`,
      },
      // Visure openapi/pricing/checkout/history: Next App Router routes (no PHP :8089 rewrite)
      {
        source: "/api/client-area/visure/history",
        destination: `${localPhpApiOrigin}/api/client-area/visure/history.php`,
      },
      {
        source: "/api/client-area/consulenza-utenze/history",
        destination: `${localPhpApiOrigin}/api/client-area/consulenza-utenze/history.php`,
      },
      {
        source: "/api/client-area/consulenza-utenze/create",
        destination: `${localPhpApiOrigin}/api/client-area/consulenza-utenze/create.php`,
      },
      {
        source: "/api/client-area/web-agency/history",
        destination: `${localPhpApiOrigin}/api/client-area/web-agency/history.php`,
      },
      {
        source: "/api/client-area/web-agency/create",
        destination: `${localPhpApiOrigin}/api/client-area/web-agency/create.php`,
      },
      {
        source: "/api/client-area/caf-patronato/file-download",
        destination: `${localPhpApiOrigin}/api/client-area/caf-patronato/file-download.php`,
      },
      {
        source: "/api/client-area/caf-patronato/history",
        destination: `${localPhpApiOrigin}/api/client-area/caf-patronato/history.php`,
      },
      {
        source: "/api/client-area/caf-patronato/checkout",
        destination: `${localPhpApiOrigin}/api/client-area/caf-patronato/checkout.php`,
      },
      {
        source: "/api/client-area/caf-patronato/finalize",
        destination: `${localPhpApiOrigin}/api/client-area/caf-patronato/finalize.php`,
      },
      // caf-patronato/pricing served by Next App Router route
    ];
  },
  async redirects() {
    if (staticExportEnabled) {
      return [];
    }
    return [
      { source: "/servizi/telefonia/windtre", destination: "/servizi/telefonia", permanent: true },
      { source: "/servizi/telefonia/very-mobile", destination: "/servizi/telefonia", permanent: true },
      { source: "/servizi/energia/windtre-luce-gas", destination: "/servizi/energia", permanent: true },
      { source: "/area-clienti/spedizioni", destination: "/area-clienti/brt", permanent: true },
      { source: "/area-clienti/spedizioni/:path*", destination: "/area-clienti/brt", permanent: true },
      { source: "/area-clienti/web-agency", destination: "/area-clienti", permanent: true },
      { source: "/area-clienti/web-agency/:path*", destination: "/area-clienti", permanent: true },
      { source: "/area-clienti/consulenza-utenze", destination: "/area-clienti/contratti-energia", permanent: true },
      { source: "/area-clienti/consulenza-utenze/:path*", destination: "/area-clienti/contratti-energia", permanent: true },
      { source: "/area-clienti/fotocopie", destination: "/area-clienti", permanent: true },
      { source: "/area-clienti/fotocopie/:path*", destination: "/area-clienti", permanent: true },
    ];
  },
  // Pin workspace root so Vercel post-build doesn't look for .next in the wrong place.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      three: path.resolve(__dirname, "node_modules/three"),
      "@splinetool/react-spline": path.resolve(
        __dirname,
        "node_modules/@splinetool/react-spline/dist/react-spline.js",
      ),
    };
    return config;
  },
};

export default nextConfig;
