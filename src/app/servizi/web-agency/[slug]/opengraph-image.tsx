import { webAgencyServiceDetails, getWebAgencyServiceBySlug } from "@/lib/web-agency-services";
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export function generateStaticParams() {
  return webAgencyServiceDetails.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const service = getWebAgencyServiceBySlug(slug);

  return createOgImage({
    eyebrow: "Web Agency",
    title: service?.title ?? "Progetti digitali su misura",
    description:
      service?.shortDescription ??
      "Siti web, gestionali e sviluppo orientato a business, performance e crescita.",
    accent: "#22c55e",
    chip: "web-agency",
  });
}
