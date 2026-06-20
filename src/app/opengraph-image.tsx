import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Agenzia servizi a Castellammare di Stabia",
    title: "Telefonia, energia, spedizioni e servizi digitali",
    description:
      "Consulenza locale, assistenza operativa e soluzioni digitali in un unico punto.",
    accent: "#22d3ee",
    chip: "home",
  });
}
