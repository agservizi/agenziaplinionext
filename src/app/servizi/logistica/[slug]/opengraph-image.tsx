import { logisticsServiceDetails, getLogisticsServiceBySlug } from "@/lib/logistics-services";
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export function generateStaticParams() {
  return logisticsServiceDetails.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const service = getLogisticsServiceBySlug(slug);

  return createOgImage({
    eyebrow: "Logistica e spedizioni",
    title: service?.title ?? "Spedizioni assistite con supporto operativo",
    description:
      service?.shortDescription ??
      "Preparazione spedizioni, etichette e tracciamento con supporto in sede.",
    accent: "#fb7185",
    chip: "logistica",
  });
}
