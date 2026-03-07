import AdminCafPatronatoDashboard from "@/components/admin-area/AdminCafPatronatoDashboard";

export default function AreaAdminCafPatronatoPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Presa in carico CAF e Patronato
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Qui tengo ordinate le pratiche fiscali, previdenziali e di supporto.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          In questa sezione vedo richieste cliente, allegati iniziali, stato della mail operativa e
          i documenti già evasi. Da qui aggiorno lo stato quando devo intervenire manualmente.
        </p>
      </section>

      <AdminCafPatronatoDashboard />
    </div>
  );
}
