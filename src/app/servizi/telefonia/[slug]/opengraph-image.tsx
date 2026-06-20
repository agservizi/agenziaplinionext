import { phoneServiceDetails, getPhoneServiceBySlug } from "@/lib/phone-services";
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export function generateStaticParams() {
  return phoneServiceDetails.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const service = getPhoneServiceBySlug(slug);

  return createOgImage({
    eyebrow: "Telefonia",
    title: service?.title ?? "Offerte mobile e internet casa",
    description:
      service?.shortDescription ??
      "Supporto su attivazioni, portabilità, copertura e scelta operatore.",
    accent: "#a3e635",
    chip: "telefonia",
  });
}
