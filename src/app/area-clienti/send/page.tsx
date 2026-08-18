import SendWorkspace from "@/components/client-area/SendWorkspace";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Notifiche SEND | Area Clienti AG SERVIZI",
    description: "Crea e segui una pratica relativa a una notifica digitale SEND.",
    path: "/area-clienti/send",
  });
}

export default function SendPage() {
  return <SendWorkspace />;
}
