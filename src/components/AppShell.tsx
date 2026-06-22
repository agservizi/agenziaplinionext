"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalParallaxLayer from "@/components/GlobalParallaxLayer";
import PlatformFooter from "@/components/PlatformFooter";

const PlinioAssistantChat = dynamic(() => import("@/components/PlinioAssistantChat"), { ssr: false });
import { clearClientPortalToken, readClientPortalTokenPayload } from "@/lib/client-portal-auth";
import { clearAdminPortalToken } from "@/lib/admin-portal-auth";

const ADMIN_SIDEBAR_STATE_KEY = "admin-sidebar-collapsed";

function readAdminSidebarCollapsedSnapshot() {
  return window.localStorage.getItem(ADMIN_SIDEBAR_STATE_KEY) === "1";
}

function subscribeAdminSidebarCollapsed(onStoreChange: () => void) {
  const onToggle = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_SIDEBAR_STATE_KEY) onStoreChange();
  };

  window.addEventListener("admin-sidebar-toggle", onToggle as EventListener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("admin-sidebar-toggle", onToggle as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}


export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawPathname = usePathname();
  // Normalize trailing slash so checks work with both /login and /login/
  const pathname = rawPathname.length > 1 && rawPathname.endsWith("/") ? rawPathname.slice(0, -1) : rawPathname;
  const router = useRouter();
  const isClientRoute = pathname === "/login" || pathname.startsWith("/area-clienti");
  const isAdminRoute = pathname === "/admin-login" || pathname.startsWith("/area-admin");
  const isAdminDashboardRoute = pathname.startsWith("/area-admin");
  const isClientDashboardRoute = pathname.startsWith("/area-clienti");
  const isOperatorRoute = pathname.startsWith("/evadi-pratica");
  const isPlatformRoute = isClientRoute || isAdminRoute || isOperatorRoute;
  const showPlinioAssistant = !isAdminRoute && !isOperatorRoute && !isClientRoute;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [clientUserLabel, setClientUserLabel] = useState("");
  const adminSidebarCollapsed = useSyncExternalStore(
    subscribeAdminSidebarCollapsed,
    readAdminSidebarCollapsedSnapshot,
    () => false,
  );

  useEffect(() => {
    const toggleScrollTopButton = () => {
      setShowScrollTop(window.scrollY > 320);
    };

    toggleScrollTopButton();
    window.addEventListener("scroll", toggleScrollTopButton, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleScrollTopButton);
    };
  }, []);


  useEffect(() => {
    if (!isClientRoute || pathname === "/login") {
      setClientUserLabel("");
      return;
    }

    setClientUserLabel(readClientPortalTokenPayload()?.username || "");
  }, [isClientRoute, pathname]);

  const scrollTopButton = showScrollTop ? (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Torna in cima"
      className="fixed right-5 bottom-24 z-40 group sm:right-6 sm:bottom-28"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/80 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#5E0ED7]/30 group-hover:shadow-xl group-hover:shadow-[#5E0ED7]/15">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500 transition-colors duration-300 group-hover:text-[#5E0ED7]" fill="none" aria-hidden="true">
          <path
            d="M12 18V6M12 6l-5 5M12 6l5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  ) : null;

  // Login pages: completely standalone, no chrome
  if (pathname === "/login" || pathname === "/admin-login") {
    return <>{children}</>;
  }

  if (isPlatformRoute) {
    const isLoginPage = pathname === "/login" || pathname === "/admin-login";
    const isAdminPlatform = isAdminRoute;
    const platformLabel = isOperatorRoute
      ? "Presa in Carico"
      : isAdminPlatform
        ? "Area di Controllo"
        : "Spazio Clienti";

    return (
      <>
        <div className={`flex min-h-screen flex-col ${isAdminPlatform ? "bg-slate-50 text-slate-950" : "bg-slate-950 text-white"}`}>
          <div className={`sticky top-0 z-30 backdrop-blur-xl ${isAdminPlatform ? "border-b border-slate-200 bg-white/92" : "border-b border-white/6 bg-[#0a1122]/90 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)]"}`}>
            <div className="mx-auto flex w-full max-w-none items-center justify-between px-5 py-3.5 md:px-8 lg:px-12">
              <div className="inline-flex items-center gap-3">
                <Link href="/" className="inline-flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="AG SERVIZI"
                    width={140}
                    height={36}
                    className="h-8 w-auto"
                  />
                  <span className={`hidden text-xs font-semibold uppercase tracking-[0.2em] md:inline ${isAdminPlatform ? "text-slate-500" : "text-slate-300"}`}>
                    {platformLabel}
                  </span>
                </Link>
                {isAdminDashboardRoute ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = !readAdminSidebarCollapsedSnapshot();
                      window.localStorage.setItem(ADMIN_SIDEBAR_STATE_KEY, next ? "1" : "0");
                      window.dispatchEvent(new CustomEvent("admin-sidebar-toggle", { detail: { collapsed: next } }));
                    }}
                    className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 xl:inline-flex"
                    aria-label={adminSidebarCollapsed ? "Espandi sidebar admin" : "Collassa sidebar admin"}
                    title={adminSidebarCollapsed ? "Espandi sidebar" : "Collassa sidebar"}
                  >
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                      {adminSidebarCollapsed ? (
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                    </svg>
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {isAdminPlatform && !isLoginPage ? (
                  <div className="hidden items-center gap-2 2xl:flex">
                    <Link
                      href="/area-admin/spedizioni"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Apri spedizioni
                    </Link>
                    <Link
                      href="/area-admin/richieste"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Apri richieste
                    </Link>
                    <Link
                      href="/area-admin/ticket"
                      className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100/80"
                    >
                      Apri ticket
                    </Link>
                    <Link
                      href="/area-admin/listino-spedizioni"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Nuova regola listino
                    </Link>
                  </div>
                ) : null}
                {isClientRoute && !isLoginPage ? (
                  <div className="flex items-center gap-2">
                    {/* Torna al sito */}
                    <Link
                      href="/"
                      className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-[13px] font-medium text-slate-400 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white hover:ring-white/20"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" aria-hidden="true">
                        <path d="M19 12H5M5 12l5-5M5 12l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="hidden sm:inline">Sito</span>
                    </Link>

                    {/* Divider */}
                    <div className="mx-1 h-5 w-px bg-white/10" />

                    {/* Profilo */}
                    <Link
                      href="/area-clienti/profilo"
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-linear-to-b from-cyan-500/15 to-cyan-600/10 px-3.5 text-[13px] font-semibold text-cyan-300 ring-1 ring-cyan-400/20 transition hover:from-cyan-500/25 hover:to-cyan-600/18 hover:text-cyan-200 hover:ring-cyan-400/35"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      {clientUserLabel || "Profilo"}
                    </Link>

                    {/* Esci */}
                    <button
                      type="button"
                      onClick={() => {
                        clearClientPortalToken();
                        router.push("/login");
                      }}
                      className="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-white/8 transition hover:bg-red-500/10 hover:text-red-400 hover:ring-red-500/25"
                      aria-label="Esci dall'area clienti"
                      title="Esci"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : null}
                {!isClientRoute && !isLoginPage && !isOperatorRoute ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAdminPlatform) {
                          clearAdminPortalToken();
                          router.push("/admin-login");
                          return;
                        }

                        clearClientPortalToken();
                        router.push("/login");
                      }}
                      className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${isAdminPlatform ? "border border-slate-200 text-slate-700 hover:border-slate-300 bg-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/6"}`}
                    >
                      Esci
                    </button>
                    <Link
                      href="/"
                      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${isAdminPlatform ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "border border-white/8 bg-white/6 text-slate-200 hover:bg-white/10 hover:border-white/15"}`}
                    >
                      Torna al sito
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <main id="main-content" className={`flex-1 ${isAdminPlatform ? "bg-slate-50" : "bg-slate-950"}`}>{children}</main>
          <div className={
            isAdminDashboardRoute
              ? `transition-[padding] duration-300 ease-out ${adminSidebarCollapsed ? "lg:pl-22" : "lg:pl-72"}`
              : isClientDashboardRoute
                ? "lg:pl-60 xl:pl-64"
                : ""
          }>
            <PlatformFooter />
          </div>
        </div>
        {showPlinioAssistant ? <PlinioAssistantChat pathname={pathname} /> : null}
        {scrollTopButton}
      </>
    );
  }

  return (
    <>
      <Header />
      <GlobalParallaxLayer />
      <main id="main-content" className="min-h-screen bg-slate-950">{children}</main>
      <Footer />
      {showPlinioAssistant ? <PlinioAssistantChat pathname={pathname} /> : null}
      {scrollTopButton}
    </>
  );
}
