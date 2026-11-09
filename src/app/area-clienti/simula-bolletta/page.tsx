import SimulaBollettaWorkspace from "@/components/client-area/SimulaBollettaWorkspace";
import { requireClientAreaConfig } from "@/lib/client-area";
import { buildMetadata } from "@/lib/seo";

const config = requireClientAreaConfig("simula-bolletta");

export function generateMetadata() {
  return buildMetadata({
    title: `${config.title} | Area Clienti AG SERVIZI`,
    description: config.description,
    path: config.path,
  });
}

export default function Page() {
  return <SimulaBollettaWorkspace />;
}
