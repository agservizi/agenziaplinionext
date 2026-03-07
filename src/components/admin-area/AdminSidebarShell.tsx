"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/area-admin",
    label: "Dashboard",
    description: "Panoramica rapida del portale interno",
  },
  {
    href: "/area-admin/richieste",
    label: "Richieste",
    description: "Gestione operativa delle pratiche clienti",
  },
  {
    href: "/area-admin/visure",
    label: "Visure",
    description: "Stato provider OpenAPI e riferimenti pratica",
  },
  {
    href: "/area-admin/caf-patronato",
    label: "CAF e Patronato",
    description: "Pratiche, allegati e presa in carico dal magic link",
  },
  {
    href: "/area-admin/ticket",
    label: "Ticket Pratiche",
    description: "Contro-risposte, allegati e stati ticket cliente",
  },
  {
    href: "/area-admin/listino-caf-patronato",
    label: "Listino CAF/Patronato",
    description: "Prezzi pubblici usati da checkout, storico e mail",
  },
  {
    href: "/area-admin/listino-visure",
    label: "Listino Visure",
    description: "Prezzi usati lato cliente e checkout Stripe",
  },
  {
    href: "/area-admin/listino-spedizioni",
    label: "Listino Spedizioni",
    description: "Scaglioni prezzo per peso e volume",
  },
  {
    href: "/area-admin/pagamenti",
    label: "Pagamenti",
    description: "Incassi Stripe e stato fatture",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/area-admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const currentSection =
    NAV_ITEMS.find((item) => isActivePath(pathname, item.href))?.label || "Dashboard";

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-100 text-slate-950">
      <aside className="fixed top-[73px] bottom-0 left-0 z-20 hidden w-72 overflow-hidden border-r border-white/5 bg-[linear-gradient(180deg,#06172f_0%,#081a34_48%,#071326_100%)] lg:block">
        <div className="flex h-full min-h-0 flex-col">
          <nav className="flex-1 space-y-2 overflow-hidden px-3 py-5">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-start gap-3 rounded-2xl px-4 py-4 transition ${
                    active
                      ? "bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "hover:bg-white/8"
                  }`}
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      active ? "bg-cyan-300" : "bg-slate-500"
                    }`}
                  />
                  <span className="block min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        active ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="px-4 py-5 md:px-6 lg:hidden">
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Navigazione Admin
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-w-0 px-4 py-5 md:px-6 lg:pl-[19rem] lg:pr-8">
        <div className="mx-auto w-full max-w-[1480px] space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg font-semibold text-cyan-700 xl:flex">
                  AG
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                    Suite Admin
                  </p>
                  <div className="mt-2 flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-sm font-semibold text-slate-950">
                      {currentSection}
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        placeholder="Cerca pratiche, spedizioni, listini..."
                        className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/area-admin/richieste"
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Apri richieste
                </Link>
                <Link
                  href="/area-admin/ticket"
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                >
                  Apri ticket
                </Link>
                <Link
                  href="/area-admin/listino-spedizioni"
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Nuova regola listino
                </Link>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Carmine Cavaliere
                </div>
              </div>
            </div>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
