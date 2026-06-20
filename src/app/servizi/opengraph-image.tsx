import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Catalogo servizi",
    title: "Pagamenti, telefonia, energia, spedizioni, digital e web",
    description:
      "Un'offerta multiservizio progettata per privati, professionisti e attività locali.",
    accent: "#06b6d4",
    chip: "servizi",
  });
}
