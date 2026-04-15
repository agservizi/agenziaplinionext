"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const SIDEBAR_STATE_KEY = "admin-sidebar-collapsed";

function readSidebarCollapsedSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STATE_KEY) === "1";
}

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  const onToggle = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_STATE_KEY) onStoreChange();
  };

  window.addEventListener("admin-sidebar-toggle", onToggle as EventListener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("admin-sidebar-toggle", onToggle as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Panoramica",
    items: [
      {
        href: "/area-admin",
        label: "Dashboard",
        description: "Vista generale del backoffice",
        icon: "dashboard",
      },
    ],
  },
  {
    title: "Operativo",
    items: [
      {
        href: "/area-admin/richieste",
        label: "Richieste",
        description: "Pratiche clienti e stato avanzamento",
        icon: "requests",
        badge: "core",
      },
      {
        href: "/area-admin/spedizioni",
        label: "Spedizioni",
        description: "Tracking, manifest, pagamenti",
        icon: "shipments",
        badge: "log",
      },
      {
        href: "/area-admin/ticket",
        label: "Ticket",
        description: "Contro-risposte e allegati pratiche",
        icon: "tickets",
      },
      {
        href: "/area-admin/visure",
        label: "Visure",
        description: "Provider, documenti e storico",
        icon: "documents",
      },
      {
        href: "/area-admin/caf-patronato",
        label: "CAF/Patronato",
        description: "Pratiche e gestione magic link",
        icon: "briefcase",
      },
      {
        href: "/area-admin/fotocopie-online",
        label: "Fotocopie",
        description: "PDF, ritiro in sede e ordini",
        icon: "copy",
      },
    ],
  },
  {
    title: "Commerciale",
    items: [
      {
        href: "/area-admin/consulenza-utenze",
        label: "Consulenza Utenze",
        description: "Lead telefonia, luce e gas",
        icon: "spark",
      },
      {
        href: "/area-admin/web-agency",
        label: "Web Agency",
        description: "Brief, offerte e progetti digitali",
        icon: "layout",
      },
      {
        href: "/area-admin/pagamenti",
        label: "Pagamenti",
        description: "Stripe, fatture e riconciliazione",
        icon: "wallet",
      },
    ],
  },
  {
    title: "Cataloghi",
    items: [
      {
        href: "/area-admin/listino-spedizioni",
        label: "Listino Spedizioni",
        description: "Scaglioni per peso e volume",
        icon: "scale",
      },
      {
        href: "/area-admin/listino-visure",
        label: "Listino Visure",
        description: "Prezzi per servizio visura",
        icon: "tag",
      },
      {
        href: "/area-admin/listino-caf-patronato",
        label: "Listino CAF/Patronato",
        description: "Prezzi pubblici pratiche e servizi",
        icon: "list",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        href: "/area-admin/notifiche-email",
        label: "Notifiche Email",
        description: "Storico invii e audit Resend",
        icon: "mail",
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/area-admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const tone = active ? "text-cyan-700" : "text-slate-500";
  const cls = `h-4 w-4 ${tone}`;
  switch (name) {
    case "dashboard":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-16v5h7V4h-7Z" fill="currentColor" /></svg>;
    case "requests":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M7 4h10l3 3v13H4V4h3Zm1 4h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
    case "shipments":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M3 7h11v10H3zM14 10h3l4 3v4h-7zM7 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm13 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
    case "tickets":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 4V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
    case "documents":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "briefcase":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M8 6V4h8v2M4 8h16v11H4zM4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "copy":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M8 8h10v12H8zM6 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "spark":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
    case "layout":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 5h16v4H4zM4 11h7v8H4zM13 11h7v8h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
    case "wallet":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 7h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm0 0 12-3M16 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "scale":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M12 4v15M7 7h10M5 7l-2 4h4L5 7Zm14 0-2 4h4l-2-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "tag":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M20 10 11 19l-7-7V4h8l8 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/></svg>;
    case "list":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M8 7h11M8 12h11M8 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
    case "mail":
      return <svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
    default:
      return <span className={cn("h-2.5 w-2.5 rounded-full", active ? "bg-cyan-500" : "bg-slate-300")} />;
  }
}

export default function AdminSidebarShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readSidebarCollapsedSnapshot,
    () => false,
  );
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; x: number; y: number } | null>(null);


  const flatItems = useMemo(() => NAV_GROUPS.flatMap((group) => group.items), []);
  const currentSection =
    flatItems.find((item) => isActivePath(pathname, item.href))?.label || "Dashboard";

  const showCollapsedTooltip = (label: string, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    setHoveredTooltip({
      label,
      x: rect.right + 12,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <div data-sidebar-collapsed={collapsed ? "true" : "false"} className="admin-shell min-h-[calc(100vh-73px)] bg-slate-50 text-slate-950">
      <aside
        className={cn(
          "fixed top-[73px] bottom-0 left-0 z-20 hidden overflow-x-hidden overflow-y-hidden border-r border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] backdrop-blur transition-[width] duration-200 lg:block",
          collapsed ? "w-[5.5rem]" : "w-72",
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className={cn("pt-4", collapsed ? "px-3" : "px-4")}>
            {collapsed ? (
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-cyan-700">
                  AG
                </div>
              </div>
            ) : null}
          </div>

          <nav className={cn("flex-1 overflow-x-hidden overflow-y-auto", collapsed ? "space-y-4 px-3 py-4" : "space-y-5 px-4 py-4")}>
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                {collapsed ? (
                  <div className="flex justify-center">
                    <span className="h-px w-8 bg-slate-200" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {group.title}
                    </p>
                    <Badge className="border-slate-200 bg-slate-50 text-slate-600">{group.items.length}</Badge>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-label={collapsed ? item.label : undefined}
                        onMouseEnter={collapsed ? (event) => showCollapsedTooltip(item.label, event.currentTarget) : undefined}
                        onMouseLeave={collapsed ? () => setHoveredTooltip(null) : undefined}
                        onFocus={collapsed ? (event) => showCollapsedTooltip(item.label, event.currentTarget) : undefined}
                        onBlur={collapsed ? () => setHoveredTooltip(null) : undefined}
                        className={cn(
                          "group relative flex rounded-2xl border transition",
                          collapsed ? "justify-center px-2 py-3" : "items-start gap-3 px-4 py-3",
                          active
                            ? "border-cyan-200 bg-[linear-gradient(135deg,rgba(236,254,255,1),rgba(248,250,252,1))] shadow-sm"
                            : "border-transparent hover:border-slate-200 hover:bg-white",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition",
                            active ? "bg-cyan-500" : "bg-transparent group-hover:bg-slate-300",
                          )}
                        />
                        <span
                          className={cn(
                            "shrink-0 transition",
                            collapsed
                              ? "flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent"
                              : "flex h-10 w-10 items-center justify-center rounded-xl border",
                            !collapsed && active
                              ? "border-cyan-200 bg-cyan-100/80"
                              : !collapsed
                                ? "border-slate-200 bg-white group-hover:border-slate-300"
                                : active
                                  ? "text-cyan-700"
                                  : "text-slate-500 group-hover:text-slate-700",
                          )}
                        >
                          <NavIcon name={item.icon} active={active} />
                        </span>
                        {collapsed ? null : (
                          <span className="block min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className={cn("block text-sm font-semibold", active ? "text-slate-950" : "text-slate-700")}>
                                {item.label}
                              </span>
                              {item.badge ? (
                                <Badge className="border-slate-200 bg-slate-100 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                                  {item.badge}
                                </Badge>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {item.description}
                            </span>
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className={cn("border-t border-slate-200 py-4", collapsed ? "px-3" : "px-4")}>
            <Card className="rounded-2xl border-slate-200 bg-slate-50">
              <CardContent className={collapsed ? "p-3" : "p-4"}>
                {collapsed ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                      CC
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">On</Badge>
                    <Link href="/" aria-label="Vai al sito">
                      <Button variant="ghost" size="sm" className="rounded-xl px-3">Sito</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Operatore</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">Carmine Cavaliere</p>
                    <p className="mt-1 text-xs text-slate-500">Backoffice AG Servizi</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Sessione attiva</Badge>
                      <Link href="/">
                        <Button variant="ghost" size="sm" className="rounded-full">Vai al sito</Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      <div className="px-4 py-5 md:px-6 lg:hidden">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Navigazione Admin
                </p>
                <p className="mt-1 text-sm text-slate-500">{currentSection}</p>
              </div>
              <Badge className="border-slate-200 bg-slate-100 text-slate-600">mobile</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={active ? "secondary" : "outline"} size="sm" className="rounded-full">
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {hoveredTooltip ? (
        <div
          className="pointer-events-none fixed z-[60] -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
          style={{ left: hoveredTooltip.x, top: hoveredTooltip.y }}
        >
          {hoveredTooltip.label}
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0 px-0 py-5 transition-[padding] duration-300 ease-out lg:pr-2",
          collapsed ? "lg:pl-[5.5rem]" : "lg:pl-72",
        )}
      >
        <div className="admin-content-shell w-full space-y-5 px-2 md:px-3 lg:px-4">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
