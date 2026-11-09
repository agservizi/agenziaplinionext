import CmsJsonEditor from "@/components/cms/CmsJsonEditor";
import { readSiteSettings } from "@/lib/cms/reader";

export const dynamic = "force-dynamic";

export default async function CmsSettingsPage() {
  const data = await readSiteSettings();
  return (
    <CmsJsonEditor
      target="site-settings"
      initialData={data || {}}
      title="Impostazioni"
      description="Anagrafica, navigazione, valori, categorie e orari."
      keystaticHref="/keystatic/singleton/siteSettings"
    />
  );
}
