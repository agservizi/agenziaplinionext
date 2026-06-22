"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Container from "./Container";

const PublicBookingDrawer = dynamic(() => import("./PublicBookingDrawer"), { ssr: false });
import { navigation } from "@/lib/site-data";
import {
  fetchClientPortalProfile,
  getClientPortalToken,
  clearClientPortalToken,
  loginClientPortal,
  submitClientPortalRegistrationRequest,
} from "@/lib/client-portal-auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [clientSessionValid, setClientSessionValid] = useState(false);
  const [clientFullName, setClientFullName] = useState("");
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [dropdownView, setDropdownView] = useState<"login" | "register">("login");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const primaryNavigation = navigation.filter((item) => item.href !== "/area-clienti");
  const clientAreaCta = clientSessionValid
    ? { href: "/area-clienti", label: clientFullName || "Area clienti" }
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
    return () => { active = false; };
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
      startTransition(() => { router.push(href); });
    }, 650);
  };

  const isActive = (href: string) => pathname === href;
  const isLightPage = pathname === "/web-agency";
  const useDarkText = scrolled || isLightPage;

  const clientInitials = clientFullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  function handleLogout() {
    clearClientPortalToken();
    setClientSessionValid(false);
    setClientFullName("");
    setAvatarOpen(false);
    router.push("/");
  }

  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const token = await loginClientPortal(loginEmail.trim(), loginPassword.trim());
      const profile = await fetchClientPortalProfile(token);
      setClientSessionValid(true);
      setClientFullName((profile.profile.fullName || "").trim());
      setLoginEmail("");
      setLoginPassword("");
      setAvatarOpen(false);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Credenziali non valide");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleInlineRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError("Compila tutti i campi.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Le password non coincidono.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("La password deve avere almeno 8 caratteri.");
      return;
    }
    setRegLoading(true);
    try {
      await submitClientPortalRegistrationRequest({
        fullName: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      const token = await loginClientPortal(regEmail.trim(), regPassword);
      const profile = await fetchClientPortalProfile(token);
      setClientSessionValid(true);
      setClientFullName((profile.profile.fullName || "").trim());
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
      setAvatarOpen(false);
      router.push("/area-clienti");
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Registrazione non riuscita.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <motion.header
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0)",
          backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(148,163,184,0.15)" : "rgba(255,255,255,0)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(15,23,42,0.08)"
            : "0 0 0 rgba(0,0,0,0)",
          color: useDarkText ? "#0f172a" : "#ffffff",
        }}
        transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
        className="fixed top-0 left-0 z-30 w-full border-b"
        style={{ WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none" }}
      >
        <Container className="flex items-center justify-between py-3 sm:py-4 xl:py-5">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo.png"
              alt="AG SERVIZI"
              width={155}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="sr-only">AG SERVIZI</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 xl:flex"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => navigateWithTransition(event, item.href)}
                onMouseEnter={() => setHoveredHref(item.href)}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 2xl:text-sm ${
                  useDarkText
                    ? isActive(item.href)
                      ? "text-[#5E0ED7]"
                      : "text-slate-600 hover:text-slate-900"
                    : isActive(item.href)
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                }`}
              >
                {/* Hover pill — slides between links */}
                {hoveredHref === item.href && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: useDarkText ? "rgba(94,14,215,0.08)" : "rgba(255,255,255,0.1)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {/* Active underline */}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                    style={{ background: useDarkText ? "#5E0ED7" : "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2.5 xl:flex">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                useDarkText
                  ? "border border-slate-200 bg-white text-slate-800 hover:border-[#5E0ED7]/30 hover:shadow-md"
                  : "border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Prenota
            </button>
            {/* Avatar — unified: anon with inline login / logged with menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen((o) => !o)}
                className={`inline-flex items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-200 ${
                  useDarkText ? "hover:bg-slate-100" : "hover:bg-white/10"
                }`}
                aria-label={clientSessionValid ? "Menu utente" : "Accedi"}
                aria-expanded={avatarOpen}
                aria-haspopup="true"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  clientSessionValid
                    ? "bg-[#5E0ED7] text-white"
                    : useDarkText
                      ? "border border-slate-300 bg-slate-100 text-slate-500"
                      : "border border-white/25 bg-white/10 text-white/70"
                }`}>
                  {clientSessionValid ? clientInitials : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
                    </svg>
                  )}
                </span>
                {clientSessionValid && (
                  <span className={`text-[13px] font-semibold ${useDarkText ? "text-slate-800" : "text-white"}`}>
                    {clientFullName.split(" ")[0] || "Account"}
                  </span>
                )}
                <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 transition-transform duration-200 ${avatarOpen ? "rotate-180" : ""} ${useDarkText ? "text-slate-400" : "text-white/50"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 8l4 4 4-4" />
                </svg>
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
                  >
                    {clientSessionValid ? (
                      <>
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">{clientFullName}</p>
                          <p className="text-xs text-slate-500">Area Clienti</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/area-clienti"
                            onClick={(event) => { setAvatarOpen(false); navigateWithTransition(event, "/area-clienti"); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50"
                            style={{ color: "#0f172a" }}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: "#94a3b8" }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="3" width="7" height="7" rx="1" />
                              <rect x="3" y="14" width="7" height="7" rx="1" />
                              <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            href="/area-clienti/profilo"
                            onClick={(event) => { setAvatarOpen(false); navigateWithTransition(event, "/area-clienti/profilo"); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50"
                            style={{ color: "#0f172a" }}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: "#94a3b8" }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
                            </svg>
                            Profilo
                          </Link>
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Esci
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 pb-5">
                        {dropdownView === "login" ? (
                          <form onSubmit={handleInlineLogin}>
                            <p className="mb-3 text-sm font-semibold text-slate-900">Accedi all&apos;area clienti</p>
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                placeholder="Email o username"
                                aria-label="Email o username"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                autoComplete="username"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5E0ED7]/50 focus:ring-2 focus:ring-[#5E0ED7]/10"
                                required
                              />
                              <input
                                type="password"
                                placeholder="Password"
                                aria-label="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                autoComplete="current-password"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5E0ED7]/50 focus:ring-2 focus:ring-[#5E0ED7]/10"
                                required
                              />
                            </div>
                            {loginError && (
                              <p className="mt-2 text-xs text-red-600">{loginError}</p>
                            )}
                            <label className="mt-3 flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4 rounded border-slate-300 text-[#5E0ED7] accent-[#5E0ED7]"
                              />
                              <span className="text-xs text-slate-600">Ricorda l&apos;accesso</span>
                            </label>
                            <button
                              type="submit"
                              disabled={loginLoading}
                              className="mt-3 w-full rounded-lg bg-[#5E0ED7] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a0bab] disabled:opacity-60"
                            >
                              {loginLoading ? "Accesso..." : "Accedi"}
                            </button>
                            <Link
                              href="/login"
                              onClick={() => setAvatarOpen(false)}
                              className="mt-3 block text-center text-xs font-semibold underline"
                              style={{ color: "#0f172a" }}
                            >
                              Hai dimenticato la password?
                            </Link>
                            <button
                              type="button"
                              onClick={() => { setDropdownView("register"); setLoginError(""); }}
                              className="mt-2 block w-full text-center text-xs text-slate-500"
                            >
                              Non hai un account? <span className="font-semibold text-[#5E0ED7]">Registrati</span>
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handleInlineRegister}>
                            <p className="mb-3 text-sm font-semibold text-slate-900">Crea un account</p>
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                placeholder="Nome e cognome"
                                aria-label="Nome e cognome"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                autoComplete="name"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5E0ED7]/50 focus:ring-2 focus:ring-[#5E0ED7]/10"
                                required
                              />
                              <input
                                type="email"
                                placeholder="Email"
                                aria-label="Email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5E0ED7]/50 focus:ring-2 focus:ring-[#5E0ED7]/10"
                                required
                              />
                              <input
                                type="password"
                                placeholder="Password"
                                aria-label="Password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5E0ED7]/50 focus:ring-2 focus:ring-[#5E0ED7]/10"
                                required
                              />
                              <input
                                type="password"
                                placeholder="Conferma password"
                                aria-label="Conferma password"
                                value={regConfirm}
                                onChange={(e) => setRegConfirm(e.target.value)}
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5E0ED7]/50 focus:ring-2 focus:ring-[#5E0ED7]/10"
                                required
                              />
                            </div>
                            {regError && (
                              <p className="mt-2 text-xs text-red-600">{regError}</p>
                            )}
                            {regSuccess && (
                              <p className="mt-2 text-xs text-emerald-600">{regSuccess}</p>
                            )}
                            <button
                              type="submit"
                              disabled={regLoading}
                              className="mt-3 w-full rounded-lg bg-[#5E0ED7] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a0bab] disabled:opacity-60"
                            >
                              {regLoading ? "Invio..." : "Registrati"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDropdownView("login"); setRegError(""); setRegSuccess(""); }}
                              className="mt-3 block w-full text-center text-xs text-slate-500"
                            >
                              Hai gia un account? <span className="font-semibold text-[#5E0ED7]">Accedi</span>
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={`xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ${
              useDarkText
                ? "border border-slate-200 bg-white text-slate-900"
                : "border border-white/25 bg-white/10 text-white backdrop-blur-sm"
            }`}
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <span className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </Container>
      </motion.header>

      {/* ── Mobile overlay fullscreen ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md xl:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
            className="fixed inset-x-0 top-0 z-50 flex min-h-dvh flex-col bg-slate-950 px-6 pt-6 pb-10 text-white xl:hidden sm:px-8 md:px-10"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex">
                <Image src="/logo.png" alt="AG SERVIZI" width={135} height={28} className="h-7 w-auto brightness-0 invert" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:text-white"
                aria-label="Chiudi menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile nav links — stagger */}
            <nav className="mt-12 flex flex-1 flex-col gap-2">
              {primaryNavigation.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={reduced ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : 0.05 + i * 0.05, duration: 0.4, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    onClick={(event) => navigateWithTransition(event, item.href, () => setMobileOpen(false))}
                    className={`flex items-center rounded-xl px-4 py-3.5 text-lg font-semibold transition-colors sm:text-xl ${
                      isActive(item.href)
                        ? "bg-[#5E0ED7]/15 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#5E0ED7]" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile CTAs */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.35, duration: 0.4, ease: EASE }}
              className="flex flex-col gap-3 pt-6 border-t border-white/10"
            >
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setBookingOpen(true); }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition active:scale-[0.98] sm:text-base"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Prenota un appuntamento
              </button>
              {clientSessionValid ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5E0ED7] text-sm font-bold text-white">
                      {clientInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{clientFullName}</p>
                      <p className="text-xs text-white/40">Area Clienti</p>
                    </div>
                  </div>
                  <Link
                    href="/area-clienti"
                    onClick={(event) => navigateWithTransition(event, "/area-clienti", () => setMobileOpen(false))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5E0ED7] px-5 py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(94,14,215,0.3)] active:scale-[0.98] sm:text-base"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-500/30 px-5 py-4 text-sm font-semibold text-red-400 transition active:scale-[0.98] sm:text-base"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Esci
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={(event) => navigateWithTransition(event, "/login", () => setMobileOpen(false))}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5E0ED7] px-5 py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(94,14,215,0.3)] active:scale-[0.98] sm:text-base"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Accedi all&apos;area clienti
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PublicBookingDrawer open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
