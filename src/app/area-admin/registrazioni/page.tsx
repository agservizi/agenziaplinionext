import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ActionButton } from "@/components/portal/ApiForm";
import { listRegistrationRequests } from "@/lib/admin/portal-queries";

export const dynamic = "force-dynamic";

export default async function AdminRegistrazioniPage() {
  const result = await listRegistrationRequests(100);

  return (
    <ModuleFrame
      eyebrow="Sistema"
      title="Registrazioni"
      description="Approve crea utente + password temporanea; reject chiude la richiesta."
    >
      {!result.ok ? (
        <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
      ) : result.rows.length === 0 ? (
        <ModuleNotice variant="empty">Nessuna richiesta in coda.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["ID", "Nome", "Email", "Stato", "Data", "Azioni"]}
          rows={result.rows.map((r) => [
            String(r.id),
            String(r.full_name || "—"),
            String(r.email || "—"),
            String(r.status || "pending"),
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
            String(r.status) === "approved" || String(r.status) === "rejected" ? (
              "—"
            ) : (
              <div key={`a-${r.id}`} className="flex gap-2">
                <ActionButton
                  endpoint="/api/admin/registrations"
                  body={{ id: Number(r.id), action: "approve" }}
                  label="Approva"
                />
                <ActionButton
                  endpoint="/api/admin/registrations"
                  body={{ id: Number(r.id), action: "reject" }}
                  label="Rifiuta"
                  confirm="Rifiutare la richiesta?"
                />
              </div>
            ),
          ])}
        />
      )}
    </ModuleFrame>
  );
}
