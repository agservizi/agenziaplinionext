import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import {
  getCustomerEmailByUserId,
  listCustomerInvoices,
} from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientFatturePage() {
  const session = await readCustomerSession();
  const email =
    (session?.userId ? await getCustomerEmailByUserId(session.userId) : null) ||
    (session?.username?.includes("@") ? session.username : null);
  const rows = await listCustomerInvoices(session?.userId ?? 0, email);

  return (
    <ModuleFrame tone="client" eyebrow="Account" title="Fatture" description="Ricevute delle tue pratiche.">
      {rows.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">Nessuna fattura disponibile.</ModuleNotice>
      ) : (
        <ModuleTable
          tone="client"
          headers={["ID", "Provider", "Stato", "PDF", "Data"]}
          rows={rows.map((r) => [
            String(r.id),
            String(r.provider || "—"),
            String(r.status || "—"),
            r.invoice_pdf_url ? (
              <a
                key={`pdf-${r.id}`}
                href={String(r.invoice_pdf_url)}
                className="font-semibold text-[#5E0ED7] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Scarica
              </a>
            ) : (
              "—"
            ),
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
