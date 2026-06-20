import { energyServiceDetails, getEnergyServiceBySlug } from "@/lib/energy-services";
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export function generateStaticParams() {
  return energyServiceDetails.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const service = getEnergyServiceBySlug(slug);

  return createOgImage({
    eyebrow: "Energia",
    title: service?.title ?? "Luce e gas con supporto locale",
    description:
      service?.shortDescription ??
      "Attivazioni, subentri, volture e consulenza su offerte energia.",
    accent: "#f59e0b",
    chip: "energia",
  });
}
