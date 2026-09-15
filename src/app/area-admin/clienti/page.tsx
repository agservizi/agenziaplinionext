import Link from "next/link";
import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ActionButton } from "@/components/portal/ApiForm";
import { listClientPortalUsers } from "@/lib/admin/portal-queries";
import { readStaffSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminClientiPage() {
  const session = await readStaffSession();
  const result = await listClientPortalUsers(100);

  return (
    <ModuleFrame
      eyebrow="CRM"
      title="Clienti"
      description="Identità unica portale + bridge Saleor."
      actions={<span className="text-xs text-slate-400">Operatore: {session?.username || "—"}</span>}
    >
      {!result.ok && result.reason === "db-missing" ? (
        <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
      ) : null}
      {result.ok && result.rows.length === 0 ? (
        <ModuleNotice variant="empty">Nessun cliente registrato.</ModuleNotice>
      ) : null}
      {result.rows.length > 0 ? (
        <ModuleTable
          headers={["ID", "Nome", "Username", "Email", "Stato", "Saleor", "Azioni"]}
          rows={result.rows.map((r) => [
            String(r.id),
            String(r.full_name || "—"),
            String(r.username || "—"),
            String(r.email || "—"),
            String(r.status || "—"),
            r.saleor_customer_id ? "collegato" : "—",
            <div key={`c-${r.id}`} className="flex flex-wrap gap-2">
              <Link href={`/area-admin/clienti/${r.id}`} className="font-semibold text-cyan-700 hover:underline">
                Dettaglio
              </Link>
              <ActionButton
                endpoint="/api/admin/clients"
                body={{
                  userId: Number(r.id),
                  action: String(r.status) === "disabled" ? "enable" : "disable",
                }}
                label={String(r.status) === "disabled" ? "Abilita" : "Disabilita"}
              />
              <ActionButton
                endpoint="/api/admin/clients"
                body={{ userId: Number(r.id), action: "reset-password" }}
                label="Reset pwd"
                confirm="Generare una password temporanea?"
              />
            </div>,
          ])}
        />
      ) : null}
    </ModuleFrame>
  );
}
