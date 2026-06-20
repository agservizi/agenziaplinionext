import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "Web Agency",
    title: "Siti web e progetti digitali orientati a crescita e conversione",
    description:
      "Design, sviluppo, performance tecnica e visione commerciale in un unico team operativo.",
    accent: "#22c55e",
    chip: "web-agency",
  });
}
