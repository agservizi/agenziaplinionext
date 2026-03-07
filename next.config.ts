import type { NextConfig } from "next";

const staticExportEnabled =
  String(process.env.NEXT_STATIC_EXPORT || "false").trim().toLowerCase() === "true";
const localPhpApiOrigin = process.env.LOCAL_PHP_API_ORIGIN || "http://localhost:8089";

const nextConfig: NextConfig = {
  ...(staticExportEnabled ? { output: "export" as const } : {}),
  trailingSlash: staticExportEnabled,
  async rewrites() {
    if (staticExportEnabled) {
      return [];
    }

    return [
      {
        source: "/api/client-area/requests",
        destination: `${localPhpApiOrigin}/api/client-area/requests.php`,
      },
      {
        source: "/api/client-area/visure/openapi",
        destination: `${localPhpApiOrigin}/api/client-area/visure/openapi.php`,
      },
      {
        source: "/api/client-area/visure/history",
        destination: `${localPhpApiOrigin}/api/client-area/visure/history.php`,
      },
      {
        source: "/api/client-area/visure/checkout",
        destination: `${localPhpApiOrigin}/api/client-area/visure/checkout.php`,
      },
      {
        source: "/api/client-area/visure/pricing",
        destination: `${localPhpApiOrigin}/api/client-area/visure/pricing.php`,
      },
      {
        source: "/api/client-area/fotocopie/checkout",
        destination: `${localPhpApiOrigin}/api/client-area/fotocopie/checkout.php`,
      },
      {
        source: "/api/client-area/fotocopie/verify",
        destination: `${localPhpApiOrigin}/api/client-area/fotocopie/verify.php`,
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
      {
        source: "/api/client-area/caf-patronato/pricing",
        destination: `${localPhpApiOrigin}/api/client-area/caf-patronato/pricing.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt.php`,
      },
      {
        source: "/api/client-area/spedizioni/history",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/history.php`,
      },
      {
        source: "/api/client-area/spedizioni/checkout",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/checkout.php`,
      },
      {
        source: "/api/client-area/spedizioni/checkout/verify",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/checkout/verify.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt/confirm",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt/confirm.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt/delete",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt/delete.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt/manifest",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt/manifest.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt/pudo",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt/pudo.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt/routing",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt/routing.php`,
      },
      {
        source: "/api/client-area/spedizioni/brt/tracking",
        destination: `${localPhpApiOrigin}/api/client-area/spedizioni/brt/tracking.php`,
      },
      {
        source: "/api/admin/shipping-pricing",
        destination: `${localPhpApiOrigin}/api/admin/shipping-pricing.php`,
      },
      {
        source: "/api/admin/shipping-pricing/delete",
        destination: `${localPhpApiOrigin}/api/admin/shipping-pricing/delete.php`,
      },
      {
        source: "/api/admin/shipping-pricing/upsert",
        destination: `${localPhpApiOrigin}/api/admin/shipping-pricing/upsert.php`,
      },
      {
        source: "/api/admin/visure-pricing",
        destination: `${localPhpApiOrigin}/api/admin/visure-pricing.php`,
      },
      {
        source: "/api/admin/visure-pricing/delete",
        destination: `${localPhpApiOrigin}/api/admin/visure-pricing/delete.php`,
      },
      {
        source: "/api/admin/visure-pricing/upsert",
        destination: `${localPhpApiOrigin}/api/admin/visure-pricing/upsert.php`,
      },
      {
        source: "/api/admin/caf-patronato/pricing",
        destination: `${localPhpApiOrigin}/api/admin/caf-patronato/pricing.php`,
      },
      {
        source: "/api/admin/caf-patronato/pricing/delete",
        destination: `${localPhpApiOrigin}/api/admin/caf-patronato/pricing/delete.php`,
      },
      {
        source: "/api/admin/caf-patronato/pricing/upsert",
        destination: `${localPhpApiOrigin}/api/admin/caf-patronato/pricing/upsert.php`,
      },
      {
        source: "/api/admin/caf-patronato/requests",
        destination: `${localPhpApiOrigin}/api/admin/caf-patronato/requests.php`,
      },
      {
        source: "/api/admin/caf-patronato/requests/status",
        destination: `${localPhpApiOrigin}/api/admin/caf-patronato/requests/status.php`,
      },
      {
        source: "/api/admin/client-area/consulting-leads",
        destination: `${localPhpApiOrigin}/api/admin/client-area/consulting-leads.php`,
      },
      {
        source: "/api/admin/client-area/consulting-leads/status",
        destination: `${localPhpApiOrigin}/api/admin/client-area/consulting-leads/status.php`,
      },
      {
        source: "/api/admin/client-area/consulting-leads/quote",
        destination: `${localPhpApiOrigin}/api/admin/client-area/consulting-leads/quote.php`,
      },
      {
        source: "/api/admin/client-area/payments",
        destination: `${localPhpApiOrigin}/api/admin/client-area/payments.php`,
      },
      {
        source: "/api/admin/client-area/requests",
        destination: `${localPhpApiOrigin}/api/admin/client-area/requests.php`,
      },
      {
        source: "/api/admin/client-area/requests/status",
        destination: `${localPhpApiOrigin}/api/admin/client-area/requests/status.php`,
      },
      {
        source: "/api/admin/client-area/visure",
        destination: `${localPhpApiOrigin}/api/admin/client-area/visure.php`,
      },
      {
        source: "/api/admin/client-area/email-notifications",
        destination: `${localPhpApiOrigin}/api/admin/client-area/email-notifications.php`,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
