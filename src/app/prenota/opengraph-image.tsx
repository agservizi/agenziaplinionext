import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Prenota",
    title: "Prenota un appuntamento | AG SERVIZI",
    description:
      "Prenota un appuntamento in sede AG SERVIZI a Castellammare di Stabia per telefonia, energia, SPID, PEC e consulenze.",
    accent: "#8b5cf6",
    chip: "prenota",
  });
}
