"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import PlatformFooter from "@/components/PlatformFooter";
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
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.7" />
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
      <rect x="5" y="4" width="14" height="17" stroke="currentColor" strokeWidth="1.7" />
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


function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconLocker() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 9h16M12 9v12M8 13v2M16 13v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
  { href: "/area-clienti/contratti-telefonia", label: "Telefonia", shortLabel: "Tel", icon: <IconPhone /> },
  { href: "/area-clienti/contratti-energia", label: "Energia", shortLabel: "Luce", icon: <IconBolt /> },
  { href: "/area-clienti/simula-bolletta", label: "Simula bolletta", shortLabel: "Simula", icon: <IconBolt /> },
  { href: "/area-clienti/caf-patronato", label: "CAF / Patronato", shortLabel: "CAF", icon: <IconClipboard /> },
  { href: "/area-clienti/send", label: "SEND", shortLabel: "SEND", icon: <IconSend /> },
  { href: "/area-clienti/visure", label: "Visure", shortLabel: "Visure", icon: <IconDoc /> },
  { href: "/area-clienti/deposito-bagagli", label: "Deposito bagagli", shortLabel: "Bagagli", icon: <IconBox /> },
  { href: "/area-clienti/locker-point", label: "Locker Point", shortLabel: "Locker", icon: <IconLocker /> },
  { href: "/area-clienti/acquisti", label: "I miei acquisti", shortLabel: "Acquisti", icon: <IconBox /> },
  { href: "/area-clienti/pagamenti", label: "Pagamenti", shortLabel: "Pagamenti", icon: <IconBolt /> },
  { href: "/area-clienti/fatture", label: "Fatture", shortLabel: "Fatture", icon: <IconDoc /> },
  { href: "/area-clienti/documenti", label: "Documenti", shortLabel: "Docs", icon: <IconClipboard /> },
  { href: "/area-clienti/prenotazioni", label: "Prenotazioni", shortLabel: "Prenota", icon: <IconClipboard /> },
  { href: "/area-clienti/notifiche", label: "Notifiche", shortLabel: "Alert", icon: <IconChat /> },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/area-clienti/profilo", label: "Il mio profilo", shortLabel: "Profilo", icon: <IconUser /> },
];

const MOBILE_PRIMARY: NavItem[] = [
  SERVICE_NAV[0],
  SERVICE_NAV.find((i) => i.href.includes("/send"))!,
  SERVICE_NAV.find((i) => i.href.includes("/visure"))!,
  SERVICE_NAV.find((i) => i.href.includes("/caf-patronato"))!,
  SERVICE_NAV.find((i) => i.href.includes("/acquisti"))!,
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

function SidebarNav({
  items,
  pathname,
  onClick,
  reduceMotion,
}: {
  items: NavItem[];
  pathname: string;
  onClick?: () => void;
  reduceMotion: boolean;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item, index) => {
        const active = isActive(item.href, pathname, item.exact);
        return (
          <motion.li
            key={item.href}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: reduceMotion ? 0 : index * 0.02 }}
          >
            <Link
              href={item.href}
              onClick={onClick}
              className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-transparent text-[var(--ink)]/55 hover:border-[var(--ink)]/15 hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)] hover:text-[var(--ink)]"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}

function ClientAreaShellInner({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = rawPathname.length > 1 && rawPathname.endsWith("/") ? rawPathname.slice(0, -1) : rawPathname;
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
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
      <div className="flex h-full min-h-0 items-center justify-center bg-[var(--paper)]">
        <span className="h-6 w-6 animate-spin border-2 border-[var(--ink)]/15 border-t-[#5E0ED7]" />
      </div>
    );
  }

  const initials = buildInitials(displayName);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--paper)] text-[var(--ink)]">
      <div className="shrink-0 border-b border-[var(--ink)]/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--ink)] bg-[var(--ink)] text-sm font-bold text-[var(--paper)]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{displayName || "Cliente"}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/40">
              Area clienti
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/35">
          Servizi
        </p>
        <SidebarNav
          items={SERVICE_NAV}
          pathname={pathname}
          onClick={() => setMobileOpen(false)}
          reduceMotion={reduceMotion}
        />

        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/35">
            Account
          </p>
          <SidebarNav
            items={ACCOUNT_NAV}
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--ink)]/10 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-[var(--ink)]/45 transition hover:text-[var(--ink)]"
        >
          Torna al sito
        </Link>
        <button
          type="button"
          onClick={() => {
            clearClientPortalToken();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-[var(--ink)]/45 transition hover:text-[#5E0ED7]"
        >
          <IconLogout />
          Esci
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--paper)] text-[var(--ink)] lg:flex-row">
      <aside className="hidden h-full w-60 shrink-0 flex-col overflow-hidden border-r border-[var(--ink)]/10 xl:w-64 lg:flex">
        {sidebarContent}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-20 shrink-0 overflow-x-auto border-b border-[var(--ink)]/10 bg-[var(--paper)] lg:hidden">
          <div className="flex gap-1 px-3 py-2">
            {MOBILE_PRIMARY.map((item) => {
              const active = isActive(item.href, pathname, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 flex-col items-center gap-1 border px-3 py-2 text-center transition ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-transparent text-[var(--ink)]/45 hover:border-[var(--ink)]/15"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{item.shortLabel}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex shrink-0 flex-col items-center gap-1 border border-transparent px-3 py-2 text-[var(--ink)]/45 transition hover:border-[var(--ink)]/15"
              aria-label="Menu navigazione"
            >
              <IconMenu />
              <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Menu</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="client-sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-[var(--ink)]/40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                key="client-sidebar-drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] as const }}
                className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--ink)]/10 bg-[var(--paper)] shadow-xl lg:hidden"
              >
                <div className="absolute right-3 top-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)]/60 hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  >
                    <IconClose />
                  </button>
                </div>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full flex-col">
            <div className="flex-1">{children}</div>
            <PlatformFooter tone="client" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientAreaShell({ children }: { children: React.ReactNode }) {
  return <ClientAreaShellInner>{children}</ClientAreaShellInner>;
}
