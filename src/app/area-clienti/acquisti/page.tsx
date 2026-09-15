import Link from "next/link";
import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import {
  listCustomerEntitlements,
  listCustomerOrderMirrors,
} from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientAcquistiPage() {
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  const [orders, downloads] = await Promise.all([
    listCustomerOrderMirrors(userId, 5),
    listCustomerEntitlements(userId),
  ]);

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Acquisti"
      title="I miei acquisti"
      description={`Ciao ${session?.username || "cliente"} — ordini shop e pratiche servizi.`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/area-clienti/ordini"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/40"
        >
          <h2 className="font-semibold">Ordini shop</h2>
          <p className="mt-1 text-sm text-white/50">
            {orders.length} recenti · PHYSICAL · DIGITAL · SERVICE
          </p>
        </Link>
        <Link
          href="/area-clienti/download"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/40"
        >
          <h2 className="font-semibold">Download</h2>
          <p className="mt-1 text-sm text-white/50">{downloads.length} entitlement attivi</p>
        </Link>
        <Link
          href="/area-clienti/spedizioni-ordini"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/40"
        >
          <h2 className="font-semibold">Spedizioni shop</h2>
          <p className="mt-1 text-sm text-white/50">Solo PHYSICAL con tracking</p>
        </Link>
        <Link
          href="/area-clienti/servizi-acquistati"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/40"
        >
          <h2 className="font-semibold">Servizi acquistati</h2>
          <p className="mt-1 text-sm text-white/50">Stati SERVICE fino a completato</p>
        </Link>
        <Link
          href="/shop"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#5E0ED7]/50 sm:col-span-2"
        >
          <h2 className="font-semibold">Vai allo shop</h2>
          <p className="mt-1 text-sm text-white/50">Continua gli acquisti sul catalogo</p>
        </Link>
      </div>

      {orders.length === 0 && downloads.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">
          Ancora nessun acquisto shop. Le pratiche servizi restano nei moduli dedicati.
        </ModuleNotice>
      ) : null}
    </ModuleFrame>
  );
}
