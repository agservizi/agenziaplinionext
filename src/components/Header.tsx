"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Container from "./Container";
import PublicBookingDrawer from "./PublicBookingDrawer";
import { navigation } from "@/lib/site-data";
import {
  fetchClientPortalProfile,
  getClientPortalToken,
} from "@/lib/client-portal-auth";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [clientSessionValid, setClientSessionValid] = useState(false);
  const [clientFullName, setClientFullName] = useState("");
  const primaryNavigation = navigation.filter((item) => item.href !== "/area-clienti");
  const clientAreaCta = clientSessionValid
    ? {
        href: "/area-clienti",
        label: clientFullName || "Area clienti",
      }
    : { href: "/login", label: "Accedi all'area clienti" };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen && !bookingOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setBookingOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bookingOpen, mobileOpen]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const token = getClientPortalToken();
      if (!token) {
        if (!active) return;
        setClientSessionValid(false);
        setClientFullName("");
        return;
      }

      try {
        const payload = await fetchClientPortalProfile(token);
        if (!active) return;
        setClientSessionValid(true);
        setClientFullName((payload.profile.fullName || "").trim());
      } catch {
        if (!active) return;
        setClientSessionValid(false);
        setClientFullName("");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (mobileOpen || bookingOpen) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    } else {
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    }
    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    };
  }, [bookingOpen, mobileOpen]);

  const navigateWithTransition = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    onBeforeNavigate?: () => void,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      pathname === href
    ) {
      onBeforeNavigate?.();
      return;
    }

    event.preventDefault();
    onBeforeNavigate?.();
    window.dispatchEvent(new Event("ag-page-transition-start"));
    window.setTimeout(() => {
      startTransition(() => {
        router.push(href);
      });
    }, 220);
  };

  return (
    <header
      className={
        scrolled
          ? "fixed top-0 left-0 z-30 w-full bg-white/80 text-slate-900 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur"
          : "fixed top-0 left-0 z-30 w-full text-white navbar-ghost"
      }
    >
      <Container className="flex items-center justify-between py-5">
        <Link href="/" className="inline-flex items-center">
          <img
            src="/logo.png"
            alt="AG SERVIZI"
            width={140}
            height={36}
            className="h-8 w-auto"
          />
          <span className="sr-only">AG SERVIZI</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => navigateWithTransition(event, item.href)}
              className={
                scrolled
                  ? "relative text-sm font-medium text-slate-600 transition hover:text-slate-900 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-cyan-600 after:transition-transform after:duration-300 hover:after:scale-x-100"
                  : "relative text-sm font-medium text-white/80 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-white/80 after:transition-transform after:duration-300 hover:after:scale-x-100"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className={
              scrolled
                ? "group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:border-cyan-400 hover:text-slate-900 hover:shadow-md"
                : "group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-2.5 text-[13px] font-semibold text-white/90 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/14 hover:text-white"
            }
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-colors" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Prenota un appuntamento
          </button>
          <Link
            href={clientAreaCta.href}
            onClick={(event) => navigateWithTransition(event, clientAreaCta.href)}
            className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-cyan-400 px-5 py-2.5 text-[13px] font-bold text-slate-950 shadow-[0_2px_12px_rgba(6,182,212,0.35)] transition hover:from-cyan-400 hover:to-cyan-300 hover:shadow-[0_4px_20px_rgba(6,182,212,0.45)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {clientAreaCta.label}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={
            scrolled
              ? "md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900"
              : "md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white"
          }
          aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
        >
          <span className="relative flex h-4 w-5 flex-col justify-between">
            <span
              className={
                mobileOpen
                  ? "h-0.5 w-full translate-y-1.5 rotate-45 rounded-full bg-current transition"
                  : "h-0.5 w-full rounded-full bg-current transition"
              }
            />
            <span
              className={
                mobileOpen
                  ? "h-0.5 w-full opacity-0 transition"
                  : "h-0.5 w-full rounded-full bg-current transition"
              }
            />
            <span
              className={
                mobileOpen
                  ? "h-0.5 w-full -translate-y-1.5 -rotate-45 rounded-full bg-current transition"
                  : "h-0.5 w-full rounded-full bg-current transition"
              }
            />
          </span>
        </button>
      </Container>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }}
            className="fixed right-0 top-0 z-50 h-[100svh] w-[80%] max-w-xs overflow-y-auto overscroll-contain bg-white p-6 text-slate-900 shadow-2xl md:hidden"
            aria-hidden={!mobileOpen}
          >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Menu
          </p>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600"
            aria-label="Chiudi menu"
          >
            Chiudi
          </button>
        </div>
        <nav className="mt-8 flex flex-col gap-4">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) =>
                navigateWithTransition(event, item.href, () => setMobileOpen(false))
              }
              className="text-base font-semibold text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setBookingOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-cyan-400 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Prenota un appuntamento
          </button>
          <Link
            href={clientAreaCta.href}
            onClick={(event) =>
              navigateWithTransition(event, clientAreaCta.href, () => setMobileOpen(false))
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_2px_12px_rgba(6,182,212,0.35)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {clientAreaCta.label}
          </Link>
        </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <PublicBookingDrawer open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </header>
  );
}
