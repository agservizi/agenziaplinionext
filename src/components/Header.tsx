"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Link } from "next-view-transitions";
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
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { MenuToggleIcon } from "@/components/ui/21st/menu-toggle-icon";

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
  const [regAgeConfirmed, setRegAgeConfirmed] = useState(false);
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
  // Brutal Editorial marketing shell is paper-based: always dark ink text.
  const useDarkText = true;

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
    if (!regAgeConfirmed) {
      setRegError("Per registrarti devi dichiarare di avere almeno 14 anni.");
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
        ageConfirmed: true,
      });
      const token = await loginClientPortal(regEmail.trim(), regPassword);
      const profile = await fetchClientPortalProfile(token);
      setClientSessionValid(true);
      setClientFullName((profile.profile.fullName || "").trim());
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
      setRegAgeConfirmed(false);
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
          backgroundColor: scrolled ? "rgba(232,226,214,0.22)" : "rgba(232,226,214,0)",
          backdropFilter: scrolled ? "blur(14px) saturate(150%)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(11,17,32,0.08)" : "rgba(11,17,32,0)",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          color: "#0b1120",
        }}
        transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
        className="fixed top-0 left-0 z-30 w-full border-b site-header"
        style={{ WebkitBackdropFilter: scrolled ? "blur(14px) saturate(150%)" : "none" }}
      >
        <Container className="flex items-center justify-between py-3 sm:py-4 xl:py-5">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center" data-flip-share="logo">
            <Image
              src="/logo.png"
              alt="AG SERVIZI"
              width={155}
              height={32}
              className="h-8 w-auto site-logo"
              priority
              style={{ viewTransitionName: "site-logo" }}
            />
            <span className="sr-only">AG SERVIZI</span>
          </Link>

          {/* Desktop nav */}
          <LayoutGroup id="site-nav">
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
                  className="nav-ghost-link relative px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 2xl:text-xs"
                  data-active={isActive(item.href) ? "true" : "false"}
                >
                  {hoveredHref === item.href && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 rounded-full border border-[var(--ink)]/8 bg-white/35 shadow-[0_4px_14px_rgba(11,17,32,0.06)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 z-10 h-0.5 rounded-full bg-[#5E0ED7]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </nav>
          </LayoutGroup>

          {/* Desktop CTAs — Brutal Editorial */}
          <div className="hidden items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className={`group inline-flex h-11 items-center gap-2 border px-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
                useDarkText
                  ? "border-[var(--ink)]/20 bg-[var(--paper)] text-[var(--ink)] hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                  : "border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/15"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center ${
                  useDarkText ? "border border-[var(--ink)]/15" : "border border-white/25"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="0" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
                </svg>
              </span>
              <span className="pr-3">Prenota</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen((o) => !o)}
                className={`inline-flex h-11 items-center gap-2 border px-1.5 transition-colors duration-200 ${
                  useDarkText
                    ? "border-[var(--ink)]/20 bg-[var(--paper)] text-[var(--ink)] hover:border-[#5E0ED7]"
                    : "border-white/25 bg-white/10 text-white hover:border-white/50"
                }`}
                aria-label={clientSessionValid ? "Menu utente" : "Accedi"}
                aria-expanded={avatarOpen}
                aria-haspopup="true"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center text-xs font-bold ${
                    clientSessionValid
                      ? "bg-[var(--ink)] text-white"
                      : useDarkText
                        ? "border border-[var(--ink)]/15 text-[var(--ink)]/55"
                        : "border border-white/25 text-white/70"
                  }`}
                >
                  {clientSessionValid ? clientInitials : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
                    </svg>
                  )}
                </span>
                {clientSessionValid && (
                  <span className={`pr-1 text-[11px] font-bold uppercase tracking-[0.12em] ${useDarkText ? "text-[var(--ink)]" : "text-white"}`}>
                    {clientFullName.split(" ")[0] || "Account"}
                  </span>
                )}
                <svg viewBox="0 0 20 20" className={`mr-1 h-3.5 w-3.5 transition-transform duration-200 ${avatarOpen ? "rotate-180" : ""} ${useDarkText ? "text-[var(--ink)]/40" : "text-white/50"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M6 8l4 4 4-4" />
                </svg>
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="absolute right-0 top-full mt-2 w-80 border border-[var(--ink)]/15 bg-[var(--paper)] text-[var(--ink)] shadow-[-12px_16px_40px_rgba(11,17,32,0.12)]"
                  >
                    {clientSessionValid ? (
                      <>
                        <div className="border-b border-[var(--ink)]/10 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">Area clienti</p>
                          <p className="mt-1 text-sm font-bold uppercase tracking-[0.06em] text-[var(--ink)]">{clientFullName}</p>
                        </div>
                        <div>
                          <Link
                            href="/area-clienti"
                            onClick={(event) => { setAvatarOpen(false); navigateWithTransition(event, "/area-clienti"); }}
                            className="flex items-center gap-3 border-b border-[var(--ink)]/10 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)] hover:text-[#5E0ED7]"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--ink)]/40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                              <rect x="3" y="3" width="7" height="7" rx="0" />
                              <rect x="14" y="3" width="7" height="7" rx="0" />
                              <rect x="3" y="14" width="7" height="7" rx="0" />
                              <rect x="14" y="14" width="7" height="7" rx="0" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            href="/area-clienti/profilo"
                            onClick={(event) => { setAvatarOpen(false); navigateWithTransition(event, "/area-clienti/profilo"); }}
                            className="flex items-center gap-3 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)] hover:text-[#5E0ED7]"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--ink)]/40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
                            </svg>
                            Profilo
                          </Link>
                        </div>
                        <div className="border-t border-[var(--ink)]/10">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-50"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Esci
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-5">
                        {dropdownView === "login" ? (
                          <form onSubmit={handleInlineLogin}>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">Area clienti</p>
                            <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--ink)]">Accedi</p>
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                placeholder="Email o username"
                                aria-label="Email o username"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                autoComplete="username"
                                className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                required
                              />
                              <input
                                type="password"
                                placeholder="Password"
                                aria-label="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                autoComplete="current-password"
                                className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                required
                              />
                            </div>
                            {loginError && (
                              <p className="mt-2 border border-red-700/25 bg-red-50 px-3 py-2 text-xs text-red-900">{loginError}</p>
                            )}
                            <label className="mt-3 flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4 shrink-0 appearance-none border border-[var(--ink)]/25 bg-[var(--paper)] accent-[#5E0ED7] checked:border-[var(--ink)] checked:bg-[var(--ink)]"
                              />
                              <span className="text-[11px] text-[var(--ink)]/55">Ricorda l&apos;accesso</span>
                            </label>
                            <button
                              type="submit"
                              disabled={loginLoading}
                              className="brutal-cta-ink mt-4 w-full bg-[var(--ink)] py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:opacity-60"
                            >
                              {loginLoading ? "Accesso..." : "Accedi"}
                            </button>
                            <Link
                              href="/login"
                              onClick={() => setAvatarOpen(false)}
                              className="mt-3 block text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] underline decoration-[var(--ink)]/25 underline-offset-2 transition hover:text-[#5E0ED7]"
                            >
                              Password dimenticata?
                            </Link>
                            <button
                              type="button"
                              onClick={() => { setDropdownView("register"); setLoginError(""); }}
                              className="mt-2 block w-full text-center text-[11px] text-[var(--ink)]/50"
                            >
                              Non hai un account?{" "}
                              <span className="font-bold uppercase tracking-[0.08em] text-[#5E0ED7]">Registrati</span>
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handleInlineRegister}>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">Area clienti</p>
                            <p className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--ink)]">Crea account</p>
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                placeholder="Nome e cognome"
                                aria-label="Nome e cognome"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                autoComplete="name"
                                className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                required
                              />
                              <input
                                type="email"
                                placeholder="Email"
                                aria-label="Email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                required
                              />
                              <input
                                type="password"
                                placeholder="Password"
                                aria-label="Password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                autoComplete="new-password"
                                className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                required
                              />
                              <input
                                type="password"
                                placeholder="Conferma password"
                                aria-label="Conferma password"
                                value={regConfirm}
                                onChange={(e) => setRegConfirm(e.target.value)}
                                autoComplete="new-password"
                                className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_92%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
                                required
                              />
                              <label className="flex items-start gap-2 pt-1 text-[11px] leading-snug text-[var(--ink)]/55">
                                <input
                                  type="checkbox"
                                  checked={regAgeConfirmed}
                                  onChange={(e) => setRegAgeConfirmed(e.target.checked)}
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 appearance-none border border-[var(--ink)]/25 bg-[var(--paper)] accent-[#5E0ED7] checked:border-[var(--ink)] checked:bg-[var(--ink)]"
                                  required
                                />
                                <span>
                                  Dichiaro di avere almeno 14 anni. Se ho meno di 14 anni, un genitore o tutore deve prestare il consenso al trattamento dei dati.
                                </span>
                              </label>
                            </div>
                            {regError && (
                              <p className="mt-2 border border-red-700/25 bg-red-50 px-3 py-2 text-xs text-red-900">{regError}</p>
                            )}
                            {regSuccess && (
                              <p className="mt-2 border border-emerald-700/25 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{regSuccess}</p>
                            )}
                            <button
                              type="submit"
                              disabled={regLoading}
                              className="brutal-cta-ink mt-4 w-full bg-[var(--ink)] py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:opacity-60"
                            >
                              {regLoading ? "Invio..." : "Registrati"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDropdownView("login"); setRegError(""); setRegSuccess(""); }}
                              className="mt-3 block w-full text-center text-[11px] text-[var(--ink)]/50"
                            >
                              Hai gia un account?{" "}
                              <span className="font-bold uppercase tracking-[0.08em] text-[#5E0ED7]">Accedi</span>
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

          {/* Hamburger — 21st Menu Toggle Icon, Brutal Editorial shell */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="xl:hidden inline-flex h-11 w-11 items-center justify-center border border-[var(--ink)]/20 bg-[var(--paper)] text-[var(--ink)] transition-colors duration-200 hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={mobileOpen}
          >
            <MenuToggleIcon open={mobileOpen} className="h-5 w-5" duration={reduced ? 0 : 420} />
          </button>
        </Container>
      </motion.header>

      {/* ── Mobile overlay fullscreen ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            role="presentation"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[var(--ink)]/40 xl:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
            className="fixed inset-x-0 top-0 z-50 flex min-h-dvh flex-col border-b border-[var(--ink)]/10 bg-[var(--paper)] px-6 pt-6 pb-10 text-[var(--ink)] xl:hidden sm:px-8 md:px-10"
          >
            <div className="flex items-center justify-between border-b border-[var(--ink)]/10 pb-5">
              <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex">
                <Image src="/logo.png" alt="AG SERVIZI" width={135} height={28} className="h-7 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center border border-[var(--ink)]/20 text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
                aria-label="Chiudi menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
                Menu
              </p>
              {primaryNavigation.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={reduced ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : 0.04 + i * 0.04, duration: 0.35, ease: EASE }}
                  className="border-t border-[var(--ink)]/10 last:border-b"
                >
                  <Link
                    href={item.href}
                    onClick={(event) => navigateWithTransition(event, item.href, () => setMobileOpen(false))}
                    className={`flex items-center px-1 py-4 transition-colors ${
                      isActive(item.href)
                        ? "text-[#5E0ED7]"
                        : "text-[var(--ink)] hover:text-[#5E0ED7]"
                    }`}
                  >
                    <span className="display-type text-[clamp(1.75rem,7vw,2.75rem)] leading-none">
                      {item.label}
                    </span>
                    {isActive(item.href) && (
                      <span className="ml-auto h-2 w-2 bg-[#5E0ED7]" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.3, duration: 0.35, ease: EASE }}
              className="flex flex-col gap-3 border-t border-[var(--ink)]/10 pt-6"
            >
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setBookingOpen(true); }}
                className="inline-flex w-full items-center justify-center gap-2 border border-[var(--ink)]/20 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7] active:scale-[0.98] sm:text-base"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Prenota un appuntamento
              </button>
              {clientSessionValid ? (
                <>
                  <div className="flex items-center gap-3 border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--ink)] text-sm font-bold text-white">
                      {clientInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold uppercase tracking-[0.06em] text-[var(--ink)]">{clientFullName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">Area Clienti</p>
                    </div>
                  </div>
                  <Link
                    href="/area-clienti"
                    onClick={(event) => navigateWithTransition(event, "/area-clienti", () => setMobileOpen(false))}
                    className="brutal-cta-ink inline-flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#5E0ED7] active:scale-[0.98] sm:text-base"
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
                    className="inline-flex w-full items-center justify-center gap-2 border border-red-700/30 px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-red-800 transition hover:border-red-700 active:scale-[0.98] sm:text-base"
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
                  className="brutal-cta-ink inline-flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#5E0ED7] active:scale-[0.98] sm:text-base"
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
