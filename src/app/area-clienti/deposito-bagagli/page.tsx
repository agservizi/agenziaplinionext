import { Suspense } from "react";
import Link from "next/link";
import DepositoBookingClient from "@/app/deposito-bagagli/DepositoBookingClient";
import { buildMetadata } from "@/lib/seo";
import { requireClientAreaConfig } from "@/lib/client-area";

const config = requireClientAreaConfig("deposito-bagagli");

export function generateMetadata() {
  return buildMetadata({
    title: `${config.title} | Area Clienti AG SERVIZI`,
    description: config.description,
    path: config.path,
  });
}

export default function DepositoBagagliAreaPage() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Area clienti</p>
        <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">{config.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">{config.subtitle}</p>
        <Link
          href="/deposito-bagagli/i-miei-depositi"
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7] hover:underline"
        >
          Verifica un deposito esistente
        </Link>
      </section>
      <Suspense fallback={<p className="p-8 text-sm text-[var(--ink)]/50">Caricamento prenotazione…</p>}>
        <DepositoBookingClient tone="client" />
      </Suspense>
    </div>
  );
}
