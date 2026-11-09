import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import WebAgencyCaseStudy from "@/components/web-agency/WebAgencyCaseStudy";
import {
  getPortfolioProjectBySlug,
  getPortfolioSlugs,
} from "@/lib/web-agency-portfolio";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPortfolioSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);
  if (!project) {
    return buildMetadata({
      title: "Progetto non trovato | Web Agency",
      description: "Case study non disponibile.",
      path: `/web-agency/lavori/${slug}`,
    });
  }

  return buildMetadata({
    title: `${project.title} | Portfolio Web Agency AG SERVIZI`,
    description: project.summary,
    path: `/web-agency/lavori/${project.slug}`,
  });
}

export default async function WebAgencyCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <WebAgencyCaseStudy project={project} />
      <BreadcrumbJsonLd
        items={[
          { name: "Web Agency", href: "/web-agency" },
          { name: "Lavori", href: "/web-agency/lavori" },
          { name: project.title, href: `/web-agency/lavori/${project.slug}` },
        ]}
      />
    </>
  );
}
