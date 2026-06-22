import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Chi siamo",
    title: "Chi siamo | AG SERVIZI",
    description:
      "AG SERVIZI a Castellammare di Stabia dal 2016. Persone vere, risposte rapide, niente call center.",
    accent: "#0ea5e9",
    chip: "chi siamo",
  });
}
