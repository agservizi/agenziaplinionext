"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "./Container";
import { navigation } from "@/lib/site-data";

const CART_PRODUCT_KEY = "ag:selectedCheckoutProduct";

function getCheckoutUrlFromStorage(): string {
  if (typeof window === "undefined") return "/checkout";
  const productId = window.localStorage.getItem(CART_PRODUCT_KEY)?.trim();
  return productId ? `/checkout?product=${encodeURIComponent(productId)}` : "/checkout";
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCheckoutUrl, setCartCheckoutUrl] = useState("/checkout");

  const trackContactClick = () => {
    if (typeof window === "undefined") return;
    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", "click_contatti", { event_category: "contatti" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (mobileOpen) {
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
  }, [mobileOpen]);

  useEffect(() => {
    const updateCartUrl = () => setCartCheckoutUrl(getCheckoutUrlFromStorage());
    updateCartUrl();
    window.addEventListener("storage", updateCartUrl);
    window.addEventListener("ag-cart-product-updated", updateCartUrl);
    return () => {
      window.removeEventListener("storage", updateCartUrl);
      window.removeEventListener("ag-cart-product-updated", updateCartUrl);
    };
  }, []);

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
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={cartCheckoutUrl}
            aria-label="Vai al checkout"
            className={
              scrolled
                ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition hover:border-slate-400"
                : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:border-white/70 hover:bg-white/20"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h2.2a1 1 0 0 1 .97.76L6.2 8.2a1 1 0 0 0 .97.76h12.1a1 1 0 0 1 .98 1.2l-1.1 5.2a1 1 0 0 1-.98.8H8.4" />
            </svg>
          </Link>
          <Link
            href="/contatti"
            className={
              scrolled
                ? "rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                : "rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/20"
            }
            onClick={trackContactClick}
          >
            Contattaci
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
      <div
        className={
          mobileOpen
            ? "fixed inset-0 z-40 bg-black/40 opacity-100 transition-opacity md:hidden"
            : "pointer-events-none fixed inset-0 z-40 bg-black/40 opacity-0 transition-opacity md:hidden"
        }
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={
          mobileOpen
            ? "fixed right-0 top-0 z-50 h-[100svh] w-[80%] max-w-xs translate-x-0 overflow-y-auto overscroll-contain bg-white p-6 text-slate-900 shadow-2xl transition-transform md:hidden"
            : "fixed right-0 top-0 z-50 h-[100svh] w-[80%] max-w-xs translate-x-full overflow-y-auto overscroll-contain bg-white p-6 text-slate-900 shadow-2xl transition-transform md:hidden"
        }
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
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-semibold text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href={cartCheckoutUrl}
            onClick={() => setMobileOpen(false)}
            aria-label="Vai al checkout"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h2.2a1 1 0 0 1 .97.76L6.2 8.2a1 1 0 0 0 .97.76h12.1a1 1 0 0 1 .98 1.2l-1.1 5.2a1 1 0 0 1-.98.8H8.4" />
            </svg>
          </Link>
          <Link
            href="/contatti"
            onClick={() => {
              setMobileOpen(false);
              trackContactClick();
            }}
            className="inline-flex w-full items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Contattaci
          </Link>
        </div>
      </aside>
    </header>
  );
}
