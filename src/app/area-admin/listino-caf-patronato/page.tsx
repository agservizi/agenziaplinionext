import AdminCafPatronatoPricingManager from "@/components/admin-area/AdminCafPatronatoPricingManager";

export default function AreaAdminListinoCafPatronatoPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Prezzi CAF e Patronato
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Qui tengo allineato il prezzo pubblico di ogni pratica.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Questo listino alimenta checkout Stripe, storico cliente e mail finale, così l’importo
          resta coerente in ogni punto del flusso.
        </p>
      </section>

      <AdminCafPatronatoPricingManager />
    </div>
  );
}
