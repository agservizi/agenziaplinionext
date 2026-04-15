import ClientAreaDashboard from "@/components/client-area/ClientAreaDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti AG SERVIZI",
    description:
      "Area clienti AG SERVIZI per richieste spedizioni, visure e pratiche CAF e patronato in sezioni dedicate.",
    path: "/area-clienti",
  });
}

export default function AreaClientiPage() {
  return <ClientAreaDashboard />;
}
