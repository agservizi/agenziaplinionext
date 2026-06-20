import { ImageResponse } from "next/og";
import OgImageTemplate from "@/components/seo/OgImageTemplate";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

type CreateOgImageOptions = {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
  chip?: string;
};

export function createOgImage({
  eyebrow,
  title,
  description,
  accent,
  chip,
}: CreateOgImageOptions) {
  return new ImageResponse(
    (
      <OgImageTemplate
        eyebrow={eyebrow}
        title={title}
        description={description}
        accent={accent}
        chip={chip}
      />
    ),
    OG_IMAGE_SIZE,
  );
}
