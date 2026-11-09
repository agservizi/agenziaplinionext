import Link from "next/link";
import { readFaqs, readHomePage, readReviews, readServices, readSiteSettings } from "@/lib/cms/reader";

export const dynamic = "force-dynamic";

export default async function CmsDashboardPage() {
  const [settings, home, faqs, reviews, services] = await Promise.all([
    readSiteSettings(),
    readHomePage(),
    readFaqs(),
    readReviews(),
    readServices(),
  ]);

  const cards = [
    { href: "/area-admin/home", label: "Home", value: Array.isArray(home?.headingWords) ? (home.headingWords as string[]).join(" · ") : "—" },
    { href: "/area-admin/impostazioni", label: "Impostazioni", value: typeof settings?.companyName === "string" ? settings.companyName : "—" },
    { href: "/area-admin/servizi", label: "Servizi", value: String(services.length) },
    { href: "/area-admin/faq", label: "FAQ", value: String(faqs.length) },
    { href: "/area-admin/recensioni", label: "Recensioni", value: String(reviews.length) },
  ];

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">CMS</p>
      <h1 className="display-type mt-3 text-[clamp(2rem,4vw,3.2rem)]">Editor del sito</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--ink)]/55">
        Modifica testi e contenuti pubblici. I file vivono nel repository (`content/`). Per campi avanzati apri Keystatic.
      </p>

      <div className="mt-10 grid gap-px bg-[var(--ink)]/10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-[var(--paper)] p-5 transition hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">{card.label}</p>
            <p className="mt-3 text-lg font-bold text-[var(--ink)]">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/keystatic"
          className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7]"
        >
          Apri Keystatic
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex border border-[var(--ink)]/20 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
        >
          Vedi sito
        </Link>
      </div>
    </div>
  );
}
