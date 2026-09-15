import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm, ActionButton } from "@/components/portal/ApiForm";
import { listStaffUsers } from "@/lib/admin/portal-queries";
import { canAccessAdminModule, readStaffSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminUtentiPage() {
  const session = await readStaffSession();
  const allowed = session ? canAccessAdminModule(session.role, "staff") : false;
  const result = allowed ? await listStaffUsers() : { ok: true as const, rows: [] };

  return (
    <ModuleFrame eyebrow="RBAC" title="Utenti staff" description="CRUD staff_users — solo SUPERADMIN.">
      {!allowed ? (
        <ModuleNotice variant="error">Accesso riservato a SUPERADMIN.</ModuleNotice>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <ApiForm
            endpoint="/api/admin/staff"
            submitLabel="Crea staff"
            fields={[
              { name: "username", label: "Username", required: true },
              { name: "email", label: "Email" },
              { name: "password", label: "Password", type: "password", required: true },
              { name: "role", label: "Ruolo (OPERATOR|ADMIN|SUPERADMIN)", defaultValue: "OPERATOR" },
            ]}
            buildBody={(v) => ({
              action: "create",
              username: v.username,
              email: v.email,
              password: v.password,
              role: v.role,
            })}
          />
          <div>
            {!result.ok ? (
              <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
            ) : result.rows.length === 0 ? (
              <ModuleNotice variant="empty">
                Nessuno staff in tabella. Seed il primo SUPERADMIN qui.
              </ModuleNotice>
            ) : (
              <ModuleTable
                headers={["ID", "Username", "Email", "Ruolo", "Stato", ""]}
                rows={result.rows.map((r) => [
                  String(r.id),
                  String(r.username),
                  String(r.email || "—"),
                  String(r.role),
                  String(r.status),
                  <ActionButton
                    key={`s-${r.id}`}
                    endpoint="/api/admin/staff"
                    body={{
                      action: String(r.status) === "disabled" ? "enable" : "disable",
                      id: Number(r.id),
                    }}
                    label={String(r.status) === "disabled" ? "Abilita" : "Disabilita"}
                  />,
                ])}
              />
            )}
          </div>
        </div>
      )}
    </ModuleFrame>
  );
}
