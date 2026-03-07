import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AG SERVIZI",
    short_name: "AG SERVIZI",
    description:
      "Consulenze per telefonia, energia, logistica, servizi digitali e web agency.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0ea5e9",
    lang: "it-IT",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: `${SITE_URL}/favicon-16x16.png`,
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: `${SITE_URL}/favicon-32x32.png`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: `${SITE_URL}/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
