import Link from "next/link";
import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import { listCustomerEntitlements } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientDownloadPage() {
  const session = await readCustomerSession();
  const rows = await listCustomerEntitlements(session?.userId ?? 0);

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Digital"
      title="Download digitali"
      description={`Entitlement firmati per ${session?.username || "te"}. Nessun URL pubblico permanente.`}
    >
      {rows.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">
          I download appariranno qui dopo un ordine DIGITAL pagato.
        </ModuleNotice>
      ) : (
        <ModuleTable
          tone="client"
          headers={["Asset", "Ordine", "Download", "Scade", ""]}
          rows={rows.map((r) => [
            String(r.asset_key),
            String(r.saleor_order_id),
            `${r.download_count}/${r.max_downloads ?? "∞"}`,
            r.expires_at ? new Date(r.expires_at as string).toLocaleString("it-IT") : "—",
            <Link
              key={String(r.id)}
              href={`/api/client-area/shop/download?id=${r.id}`}
              className="font-semibold text-cyan-300 hover:underline"
            >
              Scarica
            </Link>,
          ])}
        />
      )}
    </ModuleFrame>
  );
}
