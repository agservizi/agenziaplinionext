import { digitalServiceDetails, getDigitalServiceBySlug } from "@/lib/digital-services";
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export function generateStaticParams() {
  return digitalServiceDetails.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const service = getDigitalServiceBySlug(slug);

  return createOgImage({
    eyebrow: "Servizi digitali",
    title: service?.title ?? "SPID, PEC e strumenti digitali",
    description:
      service?.shortDescription ??
      "Attivazioni digitali e supporto operativo locale per pratiche ricorrenti.",
    accent: "#8b5cf6",
    chip: "digitali",
  });
}
