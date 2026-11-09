import fs from "node:fs";
import path from "node:path";

function w(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}

w("src/app/api/admin-auth/login/route.ts", `import { NextRequest, NextResponse } from "next/server";
import {
  STAFF_SESSION_COOKIE,
  createStaffSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";

/** CMS editor login via STORE_ADMIN_*. Callers: /admin-login. User: protect /area-admin with old admin-login. */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(\`admin-login:\${ip}\`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Troppi tentativi. Riprova tra 15 minuti." }, { status: 429 });
  }

  const expectedUser = String(process.env.STORE_ADMIN_USER || "").trim();
  const expectedPass = String(process.env.STORE_ADMIN_PASSWORD || "").trim();
  if (!expectedUser || !expectedPass) {
    return NextResponse.json({ message: "Credenziali admin non configurate" }, { status: 503 });
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Richiesta non valida" }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json({ message: "Inserisci nome utente e password" }, { status: 400 });
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ message: "Credenziali non valide" }, { status: 401 });
  }

  const token = createStaffSession({ username, role: "ADMIN" });
  const res = NextResponse.json({ ok: true, username, role: "ADMIN" });
  res.cookies.set(STAFF_SESSION_COOKIE, token, sessionCookieOptions(4 * 60 * 60));
  return res;
}
`);

w("src/app/api/admin-auth/logout/route.ts", `import { NextResponse } from "next/server";
import { STAFF_SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return res;
}
`);

w("src/components/cms/CmsLoginForm.tsx", `"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CmsLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/area-admin";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/area-admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Accesso non riuscito");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Errore di rete. Riprova.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
          Nome utente
        </span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
          placeholder="es. storeadmin"
          autoComplete="username"
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]/45">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink)]/35 focus:border-[#5E0ED7]"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </label>
      {message ? (
        <p className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700" role="alert">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="brutal-cta-ink w-full bg-[var(--ink)] px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:opacity-50"
      >
        {status === "loading" ? "Verifica…" : "Entra nell'editor"}
      </button>
    </form>
  );
}
`);

w("src/app/admin-login/page.tsx", `import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CmsLoginForm from "@/components/cms/CmsLoginForm";

export const metadata: Metadata = {
  title: "Accesso Editor Sito | AG SERVIZI",
  description: "Accedi all'editor del sito AG SERVIZI per modificare testi, immagini e contenuti pubblici.",
  robots: { index: false, follow: false },
};

const CAPABILITIES = [
  {
    title: "Home",
    body: "Hero, tagline, CTA, stats e SEO della homepage.",
  },
  {
    title: "Impostazioni",
    body: "Anagrafica, navigazione, orari, valori e categorie servizi.",
  },
  {
    title: "Schede servizi",
    body: "Testi di telefonia, energia, digitali, pagamenti, logistica e web agency.",
  },
  {
    title: "FAQ e recensioni",
    body: "Domande frequenti e recensioni Google mostrate sul sito.",
  },
  {
    title: "Anteprima",
    body: "Apri il sito pubblico e verifica subito le modifiche.",
  },
  {
    title: "Keystatic",
    body: "Editor avanzato per campi strutturati e contenuti in repository.",
  },
];

export default function AdminLoginPage() {
  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2">
        <section className="flex flex-col justify-between border-b border-[var(--ink)]/10 px-6 py-10 md:px-10 lg:border-b-0 lg:border-r lg:py-14">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/logo.png" alt="AG SERVIZI" width={155} height={32} className="h-8 w-auto" priority />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
                Editor sito
              </span>
            </Link>
            <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Area admin</p>
            <h1 className="display-type mt-4 text-[clamp(2.2rem,5vw,3.6rem)]">
              Personalizza
              <br />
              il sito
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--ink)]/55">
              Da qui gestisci i contenuti pubblici di AG SERVIZI. Le pratiche clienti restano su Gestiio; lo shop su Saleor.
            </p>
          </div>

          <ul className="mt-10 space-y-0 border border-[var(--ink)]/10">
            {CAPABILITIES.map((item) => (
              <li key={item.title} className="border-b border-[var(--ink)]/10 px-4 py-3 last:border-b-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--ink)]/55">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-center justify-center px-6 py-12 md:px-10">
          <div className="w-full max-w-sm space-y-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--ink)]">Accesso editor</h2>
              <p className="mt-2 text-sm text-[var(--ink)]/50">
                Usa le credenziali admin (\`STORE_ADMIN\`) per entrare in \`/area-admin\`.
              </p>
            </div>

            <div className="border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-5">
              <Suspense fallback={<p className="text-sm text-[var(--ink)]/45">Caricamento…</p>}>
                <CmsLoginForm />
              </Suspense>
            </div>

            <div className="space-y-2 text-center text-[11px]">
              <p className="text-[var(--ink)]/40">
                Sei un cliente?{" "}
                <Link href="/login" className="font-bold uppercase tracking-[0.08em] text-[var(--ink)]/60 underline underline-offset-2 hover:text-[#5E0ED7]">
                  Area clienti
                </Link>
              </p>
              <Link href="/" className="inline-block font-bold uppercase tracking-[0.12em] text-[var(--ink)]/35 hover:text-[#5E0ED7]">
                Torna al sito
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
`);

console.log("auth+login pages done");
