import SendWorkspace from "@/components/client-area/SendWorkspace";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Richiedi assistenza SEND | AG SERVIZI",
    description:
      "Apri una pratica per una notifica digitale SEND senza registrazione.",
    path: "/send",
  });
}

export default function PublicSendPage() {
  return <SendWorkspace guest />;
}
