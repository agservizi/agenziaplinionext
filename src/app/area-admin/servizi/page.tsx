import Link from "next/link";
import { readServices } from "@/lib/cms/reader";

export const dynamic = "force-dynamic";

export default async function CmsServicesIndexPage() {
  const services = await readServices();
  const byCat: Record<string, typeof services> = {};
  for (const svc of services) {
    (byCat[svc.category] ||= []).push(svc);
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Contenuti</p>
      <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Servizi</h1>
      <p className="mt-2 text-sm text-[var(--ink)]/55">{services.length} schede</p>
      {Object.entries(byCat).map(([category, list]) => (
        <section key={category} className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/40">{category}</h2>
          <ul className="mt-3 divide-y divide-[var(--ink)]/10 border border-[var(--ink)]/10">
            {list.map((svc) => (
              <li key={svc.fileSlug}>
                <Link
                  href={`/area-admin/servizi/${svc.fileSlug}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
                >
                  <span className="font-medium">{svc.title}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/35">{svc.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
