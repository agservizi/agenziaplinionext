"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalParallaxLayer from "@/components/GlobalParallaxLayer";
import PlatformFooter from "@/components/PlatformFooter";
import MotionProvider from "@/components/motion/MotionProvider";
import ViewTransitionsShell from "@/components/motion/ViewTransitionsShell";
import { clearClientPortalToken, readClientPortalTokenPayload } from "@/lib/client-portal-auth";

const PlinioAssistantChat = dynamic(() => import("@/components/PlinioAssistantChat"), { ssr: false });

/** Callers: src/app/layout.tsx. Replaces admin chrome with CMS standalone routes. User: Implement Keystatic Brutal CMS plan — demolish legacy area-admin. */
export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawPathname = usePathname();
  const pathname = rawPathname.length > 1 && rawPathname.endsWith("/") ? rawPathname.slice(0, -1) : rawPathname;
  const router = useRouter();
  const isClientRoute = pathname === "/login" || pathname.startsWith("/area-clienti");
  const isClientDashboardRoute = pathname.startsWith("/area-clienti");
  const isCmsRoute = pathname.startsWith("/area-admin") || pathname.startsWith("/keystatic");
  const isOperatorRoute = pathname.startsWith("/evadi-pratica");
  const isPlatformRoute = isClientRoute || isOperatorRoute;
  const showPlinioAssistant = !isOperatorRoute && !isClientRoute && !isCmsRoute;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [clientUserLabel, setClientUserLabel] = useState("");

  useEffect(() => {
    if (!(isClientRoute && pathname !== "/login")) {
      setClientUserLabel("");
      return;
    }
    setClientUserLabel(readClientPortalTokenPayload()?.username || "");
  }, [isClientRoute, pathname]);

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
    if (!isClientDashboardRoute) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [isClientDashboardRoute]);

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

  if (pathname === "/login" || pathname === "/admin-login" || isCmsRoute) {
    return <>{children}</>;
  }

  if (isPlatformRoute) {
    const isClientPlatform = isClientRoute;
    const platformLabel = isOperatorRoute ? "Presa in Carico" : "Spazio Clienti";

    return (
      <>
        <div
          className={`flex flex-col ${
            isClientDashboardRoute ? "h-dvh overflow-hidden" : "min-h-screen"
          } ${
            isClientPlatform
              ? "bg-[var(--paper)] text-[var(--ink)]"
              : "bg-slate-950 text-white"
          }`}
        >
          <header
            className={`z-30 h-14 shrink-0 ${
              isClientPlatform
                ? "border-b border-[var(--ink)]/10 bg-[var(--paper)]"
                : "border-b border-white/6 bg-[#0a1122]/90 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"
            }`}
          >
            <div className="mx-auto flex h-full w-full max-w-none items-center justify-between px-5 md:px-8 lg:px-12">
              <div className="inline-flex items-center gap-3">
                <Link href="/" className="inline-flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="AG SERVIZI"
                    width={155}
                    height={32}
                    className="h-8 w-auto"
                    priority
                  />
                  <span
                    className={`hidden text-[10px] font-bold uppercase tracking-[0.22em] md:inline ${
                      isClientPlatform ? "text-[var(--ink)]/40" : "text-slate-300"
                    }`}
                  >
                    {platformLabel}
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                {isClientRoute ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/"
                      className="group inline-flex h-9 items-center gap-1.5 border border-[var(--ink)]/15 bg-[var(--paper)] px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" aria-hidden="true">
                        <path d="M19 12H5M5 12l5-5M5 12l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="hidden sm:inline">Sito</span>
                    </Link>
                    <div className="mx-1 h-5 w-px bg-[var(--ink)]/10" />
                    <Link
                      href="/area-clienti/profilo"
                      className="inline-flex h-9 items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--paper)] transition hover:bg-[#5E0ED7] hover:border-[#5E0ED7]"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      {clientUserLabel || "Profilo"}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        clearClientPortalToken();
                        router.push("/login");
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)]/45 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
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
              </div>
            </div>
          </header>
          <main
            id="main-content"
            className={`min-h-0 flex-1 ${
              isClientDashboardRoute ? "relative overflow-hidden" : "flex flex-col"
            } ${isClientPlatform ? "bg-[var(--paper)]" : "bg-slate-950"}`}
          >
            {isClientDashboardRoute ? (
              children
            ) : (
              <div className="flex min-h-full flex-1 flex-col">
                <div className="flex-1">{children}</div>
                <PlatformFooter />
              </div>
            )}
          </main>
        </div>
        {showPlinioAssistant ? <PlinioAssistantChat pathname={pathname} /> : null}
        {scrollTopButton}
      </>
    );
  }

  return (
    <ViewTransitionsShell>
      <MotionProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <GlobalParallaxLayer />
          <main id="main-content" className="relative z-10 flex-1 bg-[var(--paper)] text-[var(--ink)]">
            {children}
          </main>
          <Footer />
        </div>
        {showPlinioAssistant ? <PlinioAssistantChat pathname={pathname} /> : null}
        {scrollTopButton}
      </MotionProvider>
    </ViewTransitionsShell>
  );
}
