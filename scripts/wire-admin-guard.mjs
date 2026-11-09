import fs from "node:fs";

fs.writeFileSync(
  "src/lib/auth/portal-guard.ts",
  `import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  STAFF_SESSION_COOKIE,
  safeNextPath,
  verifySessionToken,
} from "@/lib/auth/session";

function isCustomerProtected(pathname: string) {
  return pathname === "/area-clienti" || pathname.startsWith("/area-clienti/");
}

function isCmsProtected(pathname: string) {
  return pathname === "/area-admin" || pathname.startsWith("/area-admin/");
}

/** Callers: src/proxy.ts. User: protect /area-admin via old admin-login. */
export function enforcePortalAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isCustomerProtected(pathname)) {
    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    const session = verifySessionToken(token, "customer");
    if (!session) {
      const bridge = new URL("/auth/bridge", request.url);
      bridge.searchParams.set("kind", "customer");
      bridge.searchParams.set("next", safeNextPath(pathname, "/area-clienti"));
      return NextResponse.redirect(bridge);
    }
  }

  if (isCmsProtected(pathname)) {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = verifySessionToken(token, "staff");
    if (!session) {
      const login = new URL("/admin-login", request.url);
      login.searchParams.set("next", safeNextPath(pathname, "/area-admin"));
      return NextResponse.redirect(login);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
`,
);

fs.writeFileSync(
  "src/proxy.ts",
  `import { NextRequest } from "next/server";
import { enforcePortalAuth } from "@/lib/auth/portal-guard";

export default function proxy(request: NextRequest) {
  return enforcePortalAuth(request);
}

export const config = {
  matcher: ["/area-clienti/:path*", "/area-admin", "/area-admin/:path*"],
};
`,
);

// AppShell: treat admin-login as standalone
let shell = fs.readFileSync("src/components/AppShell.tsx", "utf8");
if (!shell.includes('pathname === "/admin-login"')) {
  shell = shell.replace(
    'if (pathname === "/login" || isCmsRoute || pathname.startsWith("/web-agency/demo")) {',
    'if (pathname === "/login" || pathname === "/admin-login" || isCmsRoute || pathname.startsWith("/web-agency/demo")) {',
  );
  fs.writeFileSync("src/components/AppShell.tsx", shell);
  console.log("AppShell updated");
}

// CmsShell: logout
let cms = fs.readFileSync("src/components/cms/CmsShell.tsx", "utf8");
if (!cms.includes("admin-auth/logout")) {
  cms = cms.replace(
    'import { usePathname } from "next/navigation";',
    'import { usePathname, useRouter } from "next/navigation";',
  );
  cms = cms.replace(
    "export default function CmsShell({ children }: { children: React.ReactNode }) {\n  const pathname = usePathname();",
    `export default function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/admin-auth/logout", { method: "POST", credentials: "same-origin" });
    router.replace("/admin-login");
    router.refresh();
  }`,
  );
  cms = cms.replace(
    `        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-9 items-center border border-[var(--ink)]/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Anteprima sito
          </Link>
        </div>`,
    `        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-9 items-center border border-[var(--ink)]/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Anteprima sito
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex h-9 items-center border border-[var(--ink)]/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Esci
          </button>
        </div>`,
  );
  fs.writeFileSync("src/components/cms/CmsShell.tsx", cms);
  console.log("CmsShell logout");
}

// Restore link on client login
let login = fs.readFileSync("src/app/login/page.tsx", "utf8");
if (!login.includes("/admin-login")) {
  login = login.replace(
    `          <div className="space-y-3 text-center">
            {/* Callers: /login. User: demolish legacy admin-login link — CMS is /area-admin Keystatic */}
            <Link
              href="/"
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/35 transition hover:text-[#5E0ED7]"
            >
              Torna al sito
            </Link>
          </div>`,
    `          <div className="space-y-3 text-center">
            <p className="text-[11px] text-[var(--ink)]/40">
              Editor del sito?{" "}
              <Link
                href="/admin-login"
                className="font-bold uppercase tracking-[0.08em] text-[var(--ink)]/60 underline decoration-[var(--ink)]/20 underline-offset-2 transition hover:text-[#5E0ED7]"
              >
                Area admin
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/35 transition hover:text-[#5E0ED7]"
            >
              Torna al sito
            </Link>
          </div>`,
  );
  fs.writeFileSync("src/app/login/page.tsx", login);
  console.log("client login link");
}

console.log("guards done");
