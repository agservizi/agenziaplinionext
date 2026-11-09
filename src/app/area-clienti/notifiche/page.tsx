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
      description="Scegli quali email vuoi ricevere. Le novità promozionali restano disattive finché non le abiliti."
    >
      <ApiForm
        tone="client"
        endpoint="/api/client-area/notifications"
        submitLabel="Salva preferenze"
        fields={[
          {
            name: "order_confirm",
            label: "Conferma ordine",
            defaultValue: prefs.order_confirm ? "true" : "false",
            options: [
              { value: "true", label: "Sì" },
              { value: "false", label: "No" },
            ],
          },
          {
            name: "shipped",
            label: "Spedizione inviata",
            defaultValue: prefs.shipped ? "true" : "false",
            options: [
              { value: "true", label: "Sì" },
              { value: "false", label: "No" },
            ],
          },
          {
            name: "digital_ready",
            label: "Download digitale pronto",
            defaultValue: prefs.digital_ready ? "true" : "false",
            options: [
              { value: "true", label: "Sì" },
              { value: "false", label: "No" },
            ],
          },
          {
            name: "service_update",
            label: "Aggiornamenti sulle pratiche",
            defaultValue: prefs.service_update ? "true" : "false",
            options: [
              { value: "true", label: "Sì" },
              { value: "false", label: "No" },
            ],
          },
          {
            name: "marketing",
            label: "Novità e promozioni",
            defaultValue: prefs.marketing ? "true" : "false",
            options: [
              { value: "true", label: "Sì" },
              { value: "false", label: "No" },
            ],
          },
        ]}
      />
    </ModuleFrame>
  );
}
