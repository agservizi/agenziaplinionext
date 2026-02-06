import Link from "next/link";
import Container from "./Container";
import { company, navigation } from "@/lib/site-data";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-12">
      <Container className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-white">{company.name}</p>
          <p className="text-sm text-slate-300">{company.legalName}</p>
          <p className="text-sm text-slate-300">{company.address}</p>
          <div className="text-sm text-slate-400">
            <p>P. IVA: {company.vat}</p>
            <p>Codice SDI: {company.sdi}</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Navigazione
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Orari e supporto
          </p>
          <p className="text-sm text-slate-300">
            Consulenze su appuntamento per privati e aziende.
          </p>
          <p className="text-sm text-slate-300">
            Integrazione area riservata e servizi digitali in evoluzione.
          </p>
        </div>
      </Container>
    </footer>
  );
}
