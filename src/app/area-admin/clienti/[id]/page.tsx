import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";
import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export const dynamic = "force-dynamic";

export default async function AdminClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId) || userId < 1) notFound();

  if (!process.env.MYSQL_HOST) {
    return (
      <ModuleFrame title="Cliente">
        <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
      </ModuleFrame>
    );
  }

  await ensureSaleorBridgeTables();
  const pool = getPool();
  const [users] = await pool.query<RowDataPacket[]>(
    `SELECT u.*, l.saleor_customer_id
     FROM client_portal_users u
     LEFT JOIN saleor_customer_links l ON l.client_user_id = u.id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  const user = users[0];
  if (!user) notFound();

  const [mirrors] = await pool.query<RowDataPacket[]>(
    `SELECT saleor_order_id, status, total_amount, currency, created_at
     FROM saleor_order_mirrors WHERE client_user_id = ? ORDER BY id DESC LIMIT 20`,
    [userId],
  );

  return (
    <ModuleFrame
      eyebrow="CRM"
      title={String(user.full_name || user.username)}
      description={`${user.email} · stato ${user.status}`}
      actions={
        <Link href="/area-admin/clienti" className="text-sm font-semibold text-cyan-700 hover:underline">
          ← Lista clienti
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Username</p>
          <p className="mt-1 font-semibold">{String(user.username)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Telefono</p>
          <p className="mt-1 font-semibold">{String(user.phone || "—")}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Saleor customer</p>
          <p className="mt-1 font-mono text-xs font-semibold">
            {String(user.saleor_customer_id || "non collegato")}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Ordini shop (mirror)</h2>
      {mirrors.length === 0 ? (
        <ModuleNotice variant="empty">Nessun ordine shop collegato.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["Ordine", "Stato", "Totale", "Data"]}
          rows={mirrors.map((m) => [
            String(m.saleor_order_id),
            String(m.status || "—"),
            m.total_amount != null ? `${m.total_amount} ${m.currency || "EUR"}` : "—",
            m.created_at ? new Date(m.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
