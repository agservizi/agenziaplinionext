import { paymentServiceDetails, getPaymentServiceBySlug } from "@/lib/payment-services";
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og";

export function generateStaticParams() {
  return paymentServiceDetails.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const service = getPaymentServiceBySlug(slug);

  return createOgImage({
    eyebrow: "Servizi di pagamento",
    title: service?.title ?? "Pagamenti assistiti",
    description:
      service?.shortDescription ??
      "Pagamenti bollettini, F24, PagoPA e operazioni assistite in sede.",
    accent: "#22d3ee",
    chip: "pagamenti",
  });
}
