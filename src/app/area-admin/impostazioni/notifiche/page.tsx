import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import { canAccessAdminModule, readStaffSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminImpostazioniNotifichePage() {
  const session = await readStaffSession();
  const allowed = session ? canAccessAdminModule(session.role, "settings") : false;

  return (
    <ModuleFrame
      eyebrow="Sistema · Notifiche"
      title="Preferenze email shop"
      description="Toggle persistiti in shop_settings.feature_flags_json."
    >
      {!allowed ? (
        <ModuleNotice variant="error">Accesso riservato a SUPERADMIN.</ModuleNotice>
      ) : (
        <ApiForm
          endpoint="/api/admin/settings"
          submitLabel="Salva preferenze"
          fields={[
            { name: "orderConfirm", label: "orderConfirm (true|false)", defaultValue: "true" },
            { name: "shipped", label: "shipped (true|false)", defaultValue: "true" },
            { name: "digitalReady", label: "digitalReady (true|false)", defaultValue: "true" },
            { name: "serviceUpdate", label: "serviceUpdate (true|false)", defaultValue: "true" },
          ]}
          buildBody={(v) => ({
            notifications: {
              orderConfirm: v.orderConfirm === "true",
              shipped: v.shipped === "true",
              digitalReady: v.digitalReady === "true",
              serviceUpdate: v.serviceUpdate === "true",
            },
          })}
        />
      )}
    </ModuleFrame>
  );
}
