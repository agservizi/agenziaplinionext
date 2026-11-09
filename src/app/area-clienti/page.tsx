import ClientAreaDashboard from "@/components/client-area/ClientAreaDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti AG SERVIZI",
    description:
      "Area clienti AG SERVIZI: telefonia, energia, SEND, visure, CAF, locker, deposito bagagli.",
    path: "/area-clienti",
  });
}

export default function AreaClientiPage() {
  return <ClientAreaDashboard />;
}
