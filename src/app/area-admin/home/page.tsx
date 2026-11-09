import CmsJsonEditor from "@/components/cms/CmsJsonEditor";
import { readHomePage } from "@/lib/cms/reader";

export const dynamic = "force-dynamic";

export default async function CmsHomePage() {
  const data = await readHomePage();
  return (
    <CmsJsonEditor
      target="home-page"
      initialData={data || {}}
      title="Home"
      description="Hero, tagline, CTA e SEO della homepage."
      keystaticHref="/keystatic/singleton/homePage"
    />
  );
}
