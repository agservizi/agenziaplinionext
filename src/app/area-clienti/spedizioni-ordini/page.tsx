import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";

export const dynamic = "force-dynamic";

export default function ClientSpedizioniOrdiniPage() {
  return (
    <ModuleFrame
      tone="client"
      eyebrow="Shop · PHYSICAL"
      title="Spedizioni ordini"
      description="Solo spedizioni shop tue, con tracking."
    >
      <ModuleNotice tone="client" variant="empty">
        Nessuna spedizione shop attiva. Comparirà dopo il fulfillment PHYSICAL.
      </ModuleNotice>
    </ModuleFrame>
  );
}
