import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Contatti diretti",
    title: "WhatsApp, telefono o sede: parli con una persona",
    description:
      "Contatto rapido, supporto locale e accesso diretto ai servizi AG SERVIZI.",
    accent: "#14b8a6",
    chip: "contatti",
  });
}
