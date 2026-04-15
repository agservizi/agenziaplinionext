"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  getClientPortalToken,
  clearClientPortalToken,
  readClientPortalTokenPayload,
} from "@/lib/client-portal-auth";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  exact?: boolean;
};

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path d="M21 8.5L12 3L3 8.5V15.5L12 21L21 15.5V8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3 8.5L12 14L21 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 14V21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9L14 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path d="M13 2L4.09 12.96A.5.5 0 0 0 4.5 13.75H11L10 22l9.91-11.96a.5.5 0 0 0-.41-.79H13L13 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function IconPrinter() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <rect x="7" y="2" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 9H19a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" />
      <rect x="7" y="14" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9h18M3 15h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const SERVICE_NAV: NavItem[] = [
  { href: "/area-clienti", label: "Dashboard", shortLabel: "Home", icon: <IconGrid />, exact: true },
  { href: "/area-clienti/spedizioni", label: "Spedizioni", shortLabel: "Spedizioni", icon: <IconBox /> },
  { href: "/area-clienti/visure", label: "Visure", shortLabel: "Visure", icon: <IconDoc /> },
  { href: "/area-clienti/caf-patronato", label: "CAF & Patronato", shortLabel: "CAF", icon: <IconClipboard /> },
  { href: "/area-clienti/consulenza-utenze", label: "Consulenza Utenze", shortLabel: "Utenze", icon: <IconBolt /> },
  { href: "/area-clienti/fotocopie", label: "Fotocopie", shortLabel: "Fotocopie", icon: <IconPrinter /> },
  { href: "/area-clienti/web-agency", label: "Web Agency", shortLabel: "Web", icon: <IconGlobe /> },
  { href: "/area-clienti/ticket-pratiche-documenti", label: "Ticket", shortLabel: "Ticket", icon: <IconChat /> },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/area-clienti/profilo", label: "Il mio profilo", shortLabel: "Profilo", icon: <IconUser /> },
];

function buildInitials(value: string) {
  const parts = value.split(/[\s._@-]/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "CL";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

function isActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

const sidebarVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

function SidebarNav({
  items,
  pathname,
  onClick,
}: {
  items: NavItem[];
  pathname: string;
  onClick?: () => void;
}) {
  return (
    <motion.ul variants={sidebarVariants} initial="hidden" animate="show" className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(item.href, pathname, item.exact);
        return (
          <motion.li key={item.href} variants={itemVariants}>
            <Link
              href={item.href}
              onClick={onClick}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-cyan-500/12 text-cyan-300"
                  : "text-slate-400 hover:bg-white/4.5 hover:text-slate-100"
              }`}
            >
              <span
                className={`shrink-0 transition-colors ${active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {active && (
                <motion.span
                  layoutId="sidebar-active-dot"
                  className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                />
              )}
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function ClientAreaShellInner({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = rawPathname.length > 1 && rawPathname.endsWith("/") ? rawPathname.slice(0, -1) : rawPathname;
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = getClientPortalToken();
    const payload = readClientPortalTokenPayload();
    if (token && payload?.username) {
      setDisplayName(payload.fullName || payload.username);
      setAuthReady(true);
    } else {
      clearClientPortalToken();
      const cb = encodeURIComponent(window.location.pathname);
      router.replace(`/login?callbackUrl=${cb}`);
    }
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1121]">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
      </div>
    );
  }

  const initials = buildInitials(displayName);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* User identity */}
      <div className="shrink-0 border-b border-white/6 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-cyan-700 text-sm font-bold text-white shadow-lg shadow-cyan-900/40">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{displayName || "Cliente"}</p>
            <p className="text-[11px] text-slate-500">Sessione attiva</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Servizi
        </p>
        <SidebarNav items={SERVICE_NAV} pathname={pathname} onClick={() => setMobileOpen(false)} />

        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Account
          </p>
          <SidebarNav items={ACCOUNT_NAV} pathname={pathname} onClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Bottom links */}
      <div className="shrink-0 border-t border-white/6 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white/4 hover:text-slate-300"
        >
          <span className="shrink-0 text-slate-600">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
              <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Torna al sito
        </Link>
        <button
          type="button"
          onClick={() => { clearClientPortalToken(); router.push("/login"); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-500/8 hover:text-red-400"
        >
          <span className="shrink-0 text-slate-600">
            <IconLogout />
          </span>
          Esci dall&apos;area clienti
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed top-16.25 bottom-0 left-0 z-20 w-60 xl:w-64 flex-col bg-[#0d1420] border-r border-white/5 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile: service tab strip */}
      <div className="lg:hidden fixed top-16.25 left-0 right-0 z-20 overflow-x-auto border-b border-white/6 bg-[#0d1420]/95 backdrop-blur-md">
        <div className="flex gap-1 px-3 py-2">
          {SERVICE_NAV.map((item) => {
            const active = isActive(item.href, pathname, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-center transition ${
                  active
                    ? "bg-cyan-500/12 text-cyan-300"
                    : "text-slate-500 hover:bg-white/4 hover:text-slate-300"
                }`}
              >
                <span className={active ? "text-cyan-400" : ""}>{item.icon}</span>
                <span className="text-[10px] font-semibold leading-tight">{item.shortLabel}</span>
              </Link>
            );
          })}
          <Link
            href="/area-clienti/profilo"
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-center transition ${
              isActive("/area-clienti/profilo", pathname)
                ? "bg-cyan-500/12 text-cyan-300"
                : "text-slate-500 hover:bg-white/4 hover:text-slate-300"
            }`}
          >
            <span className={isActive("/area-clienti/profilo", pathname) ? "text-cyan-400" : ""}>
              <IconUser />
            </span>
            <span className="text-[10px] font-semibold leading-tight">Profilo</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-slate-500 hover:bg-white/4 hover:text-slate-300 transition"
            aria-label="Menu navigazione"
          >
            <IconMenu />
            <span className="text-[10px] font-semibold leading-tight">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="client-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="client-sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1420] shadow-2xl lg:hidden"
            >
              <div className="absolute right-3 top-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/6 hover:text-white"
                >
                  <IconClose />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content — offset for fixed sidebar on desktop, tab strip on mobile */}
      <div className="min-w-0 lg:ml-60 xl:lg:ml-64">
        <div className="lg:hidden h-16.25" />
        {children}
      </div>
    </>
  );
}

export default function ClientAreaShell({ children }: { children: React.ReactNode }) {
  return <ClientAreaShellInner>{children}</ClientAreaShellInner>;
}
