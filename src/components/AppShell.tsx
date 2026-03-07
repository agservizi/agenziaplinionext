"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlatformFooter from "@/components/PlatformFooter";
import { clearClientPortalToken, readClientPortalTokenPayload } from "@/lib/client-portal-auth";
import { clearAdminPortalToken } from "@/lib/admin-portal-auth";

function humanizeSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function contactContextFromPath(pathname: string) {
  if (pathname === "/") return "Home";
  if (pathname === "/contatti") return "Contatti";
  if (pathname === "/consulenza") return "Consulenza";
  if (pathname.startsWith("/servizi/")) {
    const serviceSlug = pathname.replace("/servizi/", "").split("/")[0] || "Servizi";
    return `Servizio: ${humanizeSlug(serviceSlug)}`;
  }
  if (pathname.startsWith("/area-clienti")) return "Area Clienti";
  if (pathname.startsWith("/area-admin")) return "Area Admin";
  return humanizeSlug(pathname.replace(/\//g, " ").trim()) || "Sito";
}

function isBusinessHoursInRome() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
  const isSaturday = weekday === "Sat";

  if (isWeekday) return hour >= 9 && hour < 19;
  if (isSaturday) return hour >= 9 && hour < 13;
  return false;
}

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const isClientRoute = pathname === "/login" || pathname.startsWith("/area-clienti");
  const isAdminRoute = pathname === "/admin-login" || pathname.startsWith("/area-admin");
  const isOperatorRoute = pathname.startsWith("/evadi-pratica");
  const isPlatformRoute = isClientRoute || isAdminRoute || isOperatorRoute;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [clientUserLabel, setClientUserLabel] = useState("");
  const [isWhatsappOnline, setIsWhatsappOnline] = useState(false);
  const contactContext = contactContextFromPath(pathname);
  const whatsappMessage = `Ciao, ti contatto dal sito agenziaplinio.it (${contactContext}) per richiedere informazioni.`;
  const whatsappLink = `https://wa.me/393773798570?text=${encodeURIComponent(whatsappMessage)}`;
  const whatsappStatusLabel = isWhatsappOnline ? "Online ora" : "Offline";

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
    const refreshWhatsappAvailability = () => {
      setIsWhatsappOnline(isBusinessHoursInRome());
    };

    refreshWhatsappAvailability();
    const interval = window.setInterval(refreshWhatsappAvailability, 60_000);
    return () => {
      window.clearInterval(interval);
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
      className="fixed right-5 bottom-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-slate-900/85 text-cyan-100 shadow-[0_16px_40px_rgba(8,47,73,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-slate-900 sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M12 18V6M12 6l-5 5M12 6l5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  ) : null;

  const whatsappNotch = (
    <a
      href={whatsappLink}
      onClick={() => {
        if (typeof window !== "undefined") {
          const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
          gtag?.("event", "whatsapp_notch_click", {
            event_category: "engagement",
            event_label: contactContext,
            availability: isWhatsappOnline ? "online" : "offline",
            page_path: pathname,
          });
        }
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Contatta AG SERVIZI su WhatsApp (${whatsappStatusLabel})`}
      title={`${whatsappStatusLabel} • Apri chat WhatsApp`}
      className={`fixed right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-xl border px-3 py-2 text-xs font-semibold tracking-[0.08em] text-white shadow-[0_14px_35px_rgba(6,95,70,0.45)] transition ${
        isWhatsappOnline
          ? "border-emerald-300/30 bg-emerald-500 hover:bg-emerald-400"
          : "border-slate-300/30 bg-slate-600 hover:bg-slate-500"
      }`}
      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
    >
      WhatsApp • {whatsappStatusLabel}
    </a>
  );

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
        <div className="flex min-h-screen flex-col bg-slate-950 text-white">
          <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-none items-center justify-between px-6 py-4 md:px-10 lg:px-14">
              <Link href="/" className="inline-flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="AG SERVIZI"
                  width={140}
                  height={36}
                  className="h-8 w-auto"
                />
                <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 md:inline">
                  {platformLabel}
                </span>
              </Link>
              <div className="flex items-center gap-3">
                {isClientRoute && !isLoginPage ? (
                  <>
                    {clientUserLabel ? (
                      <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 lg:inline-flex">
                        {clientUserLabel}
                      </span>
                    ) : null}
                    <Link
                      href="/area-clienti/profilo"
                      className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
                    >
                      Profilo
                    </Link>
                  </>
                ) : null}
                {!isLoginPage && !isOperatorRoute ? (
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
                    className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
                  >
                    Esci
                  </button>
                ) : null}
                <Link
                  href="/"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Torna al sito
                </Link>
              </div>
            </div>
          </div>
          <main className="flex-1 bg-slate-950">{children}</main>
          <div className={isAdminPlatform ? "lg:pl-[18rem]" : ""}>
            <PlatformFooter />
          </div>
        </div>
        {whatsappNotch}
        {scrollTopButton}
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-950">{children}</main>
      <Footer />
      {whatsappNotch}
      {scrollTopButton}
    </>
  );
}
