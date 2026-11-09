"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/area-admin", label: "Panoramica", exact: true },
  { href: "/area-admin/home", label: "Home" },
  { href: "/area-admin/impostazioni", label: "Impostazioni" },
  { href: "/area-admin/servizi", label: "Servizi" },
  { href: "/area-admin/faq", label: "FAQ" },
  { href: "/area-admin/recensioni", label: "Recensioni" },
  { href: "/keystatic", label: "Keystatic (avanzato)" },
];

function isActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/admin-auth/logout", { method: "POST", credentials: "same-origin" });
    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--paper)] text-[var(--ink)]">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-[var(--ink)]/10 px-5 md:px-8">
        <div className="inline-flex items-center gap-3">
          <Link href="/area-admin" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="AG SERVIZI" width={140} height={28} className="h-7 w-auto" />
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40 sm:inline">
              Editor sito
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-9 items-center border border-[var(--ink)]/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Anteprima sito
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex h-9 items-center border border-[var(--ink)]/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Esci
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-[var(--ink)]/10 lg:w-56 lg:border-b-0 lg:border-r xl:w-64">
          <p className="px-5 pt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/35">
            Contenuti
          </p>
          <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:px-4 lg:py-4">
            {NAV.map((item) => {
              const active = isActive(item.href, pathname, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-transparent text-[var(--ink)]/45 hover:border-[var(--ink)]/15 hover:text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <div className="flex-1 px-5 py-8 md:px-8">{children}</div>
            <footer className="mt-auto shrink-0 border-t border-[var(--ink)]/10 px-5 py-4 text-xs text-[var(--ink)]/45 md:px-8">
              Motore Keystatic · UI Brutal Editorial · contenuto in <code className="text-[var(--ink)]/70">content/</code>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
