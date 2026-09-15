import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm, ActionButton } from "@/components/portal/ApiForm";
import { readCustomerSession } from "@/lib/auth/session";
import { listCustomerAddresses } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientIndirizziPage() {
  const session = await readCustomerSession();
  const rows = await listCustomerAddresses(session?.userId ?? 0);

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Indirizzi"
      description="Spedizione e fatturazione. CAP italiano validato."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ApiForm
          tone="client"
          endpoint="/api/client-area/addresses"
          submitLabel="Aggiungi indirizzo"
          fields={[
            { name: "kind", label: "Tipo (shipping|billing)", defaultValue: "shipping" },
            { name: "fullName", label: "Nome completo", required: true },
            { name: "line1", label: "Indirizzo", required: true },
            { name: "line2", label: "Interno / civico extra" },
            { name: "city", label: "Città", required: true },
            { name: "postalCode", label: "CAP", required: true },
            { name: "province", label: "Provincia (NA)" },
            { name: "phone", label: "Telefono" },
            { name: "isDefault", label: "Default (true|false)", defaultValue: "true" },
          ]}
          buildBody={(v) => ({
            action: "create",
            kind: v.kind,
            fullName: v.fullName,
            line1: v.line1,
            line2: v.line2,
            city: v.city,
            postalCode: v.postalCode,
            province: v.province,
            phone: v.phone,
            isDefault: v.isDefault === "true",
            country: "IT",
          })}
        />
        {rows.length === 0 ? (
          <ModuleNotice tone="client" variant="empty">Nessun indirizzo salvato.</ModuleNotice>
        ) : (
          <ModuleTable
            tone="client"
            headers={["Tipo", "Nome", "Indirizzo", "Città", "CAP", ""]}
            rows={rows.map((r) => [
              String(r.kind),
              String(r.full_name),
              `${r.line1}${r.line2 ? `, ${r.line2}` : ""}`,
              String(r.city),
              String(r.postal_code),
              <div key={`a-${r.id}`} className="flex gap-2">
                <ActionButton
                  tone="client"
                  endpoint="/api/client-area/addresses"
                  body={{ action: "set-default", id: Number(r.id) }}
                  label="Default"
                />
                <ActionButton
                  tone="client"
                  endpoint="/api/client-area/addresses"
                  body={{ action: "delete", id: Number(r.id) }}
                  label="Elimina"
                  confirm="Eliminare indirizzo?"
                />
              </div>,
            ])}
          />
        )}
      </div>
    </ModuleFrame>
  );
}
