import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Consulenza interattiva",
    title: "Richiesta guidata, rapida e già pronta per il backoffice",
    description:
      "Un flusso progettato per raccogliere la pratica corretta e far partire subito la lavorazione.",
    accent: "#38bdf8",
    chip: "consulenza",
  });
}
