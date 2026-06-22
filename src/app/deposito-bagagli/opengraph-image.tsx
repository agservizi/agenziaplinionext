import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Deposito Bagagli",
    title: "Deposito Bagagli | AG SERVIZI",
    description:
      "Prenota online il deposito bagagli e ritira in agenzia a Castellammare di Stabia.",
    accent: "#06b6d4",
    chip: "deposito-bagagli",
  });
}
