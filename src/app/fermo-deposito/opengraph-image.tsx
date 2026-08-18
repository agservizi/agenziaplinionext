import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Fermo deposito",
    title: "Fermo Deposito Pacchi | AG SERVIZI",
    description:
      "Custodia pacchi in agenzia da 0,50€ al giorno. Prenota online e ritira con codice LP.",
    accent: "#22d3ee",
    chip: "fermo-deposito",
  });
}
