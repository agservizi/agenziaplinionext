import Link from "next/link";
import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ClientAcquistiPage() {
  const session = await readCustomerSession();

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Acquisti"
      title="I miei acquisti"
      description={`Ciao ${session?.username || "cliente"} — pagamenti e pratiche servizi.`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/area-clienti/pagamenti"
          className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 transition hover:border-[#5E0ED7]"
        >
          <h2 className="font-semibold">Pagamenti</h2>
          <p className="mt-1 text-sm text-[var(--ink)]/55">Storico checkout e ricevute</p>
        </Link>
        <Link
          href="/area-clienti/fatture"
          className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 transition hover:border-[#5E0ED7]"
        >
          <h2 className="font-semibold">Fatture</h2>
          <p className="mt-1 text-sm text-[var(--ink)]/55">Documenti fiscali collegati</p>
        </Link>
        <Link
          href="/area-clienti/documenti"
          className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 transition hover:border-[#5E0ED7]"
        >
          <h2 className="font-semibold">Documenti pratiche</h2>
          <p className="mt-1 text-sm text-[var(--ink)]/55">File caricati sulle richieste</p>
        </Link>
        <Link
          href="/area-clienti/send"
          className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5 transition hover:border-[#5E0ED7]"
        >
          <h2 className="font-semibold">SEND e servizi</h2>
          <p className="mt-1 text-sm text-[var(--ink)]/55">Apri o segui una pratica</p>
        </Link>
      </div>

      <ModuleNotice tone="client" variant="empty">
        Lo shop online non è più attivo. Le pratiche servizi restano nei moduli dedicati.
      </ModuleNotice>
    </ModuleFrame>
  );
}
