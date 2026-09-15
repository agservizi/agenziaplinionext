import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { canAccessAdminModule, readStaffSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ROLES = [
  {
    role: "OPERATOR",
    perms: "Dashboard + ops legacy R/W; shop sola lettura se abilitato",
  },
  {
    role: "ADMIN",
    perms: "Shop R/W (refund, revoke, publish); impostazioni limitate; no staff",
  },
  {
    role: "SUPERADMIN",
    perms: "Staff, ruoli, impostazioni globali, delete permanente, mark-paid",
  },
] as const;

export default async function AdminRuoliPage() {
  const session = await readStaffSession();
  const allowed = session ? canAccessAdminModule(session.role, "staff") : false;

  return (
    <ModuleFrame eyebrow="RBAC" title="Ruoli" description="Matrice permessi modulo (nav + API).">
      {!allowed ? (
        <ModuleNotice variant="error">Accesso riservato a SUPERADMIN.</ModuleNotice>
      ) : (
        <div className="grid gap-3">
          {ROLES.map((r) => (
            <div key={r.role} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">{r.role}</p>
              <p className="mt-1 text-sm text-slate-600">{r.perms}</p>
            </div>
          ))}
        </div>
      )}
    </ModuleFrame>
  );
}
