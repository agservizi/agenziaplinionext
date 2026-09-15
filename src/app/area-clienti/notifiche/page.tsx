import { ModuleFrame } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import { readCustomerSession } from "@/lib/auth/session";
import { getNotificationPrefs } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientNotifichePage() {
  const session = await readCustomerSession();
  const prefs = await getNotificationPrefs(session?.userId ?? 0);

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Notifiche"
      description="Preferenze email ownership-scoped. Nessun marketing senza consenso."
    >
      <ApiForm
        tone="client"
        endpoint="/api/client-area/notifications"
        submitLabel="Salva preferenze"
        fields={[
          {
            name: "order_confirm",
            label: "Conferma ordine (true|false)",
            defaultValue: prefs.order_confirm ? "true" : "false",
          },
          {
            name: "shipped",
            label: "Spedizione inviata (true|false)",
            defaultValue: prefs.shipped ? "true" : "false",
          },
          {
            name: "digital_ready",
            label: "Download pronto (true|false)",
            defaultValue: prefs.digital_ready ? "true" : "false",
          },
          {
            name: "service_update",
            label: "Aggiornamento servizio (true|false)",
            defaultValue: prefs.service_update ? "true" : "false",
          },
          {
            name: "marketing",
            label: "Novità e promo (true|false)",
            defaultValue: prefs.marketing ? "true" : "false",
          },
        ]}
      />
    </ModuleFrame>
  );
}
