import GestiioPracticeWorkspace from "@/components/client-area/GestiioPracticeWorkspace";
import { requireClientAreaConfig } from "@/lib/client-area";
import { buildMetadata } from "@/lib/seo";

const config = requireClientAreaConfig("contratti-energia");

export function generateMetadata() {
  return buildMetadata({
    title: `${config.title} | Area Clienti AG SERVIZI`,
    description: config.description,
    path: config.path,
  });
}

export default function Page() {
  return (
    <GestiioPracticeWorkspace
      serviceSlug={config.key}
      title={config.title}
      subtitle={config.subtitle}
      fields={config.fields}
    />
  );
}
