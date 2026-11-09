import { NextRequest, NextResponse } from "next/server";
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

function isKeystaticProtected(pathname: string) {
  return (
    pathname === "/keystatic" ||
    pathname.startsWith("/keystatic/") ||
    pathname === "/api/keystatic" ||
    pathname.startsWith("/api/keystatic/")
  );
}

/**
 * Callers: src/proxy.ts.
 * Staff cookie required for /area-admin and /keystatic (security-audit AUTHZ-001).
 * User: procedi con tutto al 100%
 */
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

  if (isCmsProtected(pathname) || isKeystaticProtected(pathname)) {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = verifySessionToken(token, "staff");
    if (!session) {
      if (pathname.startsWith("/api/keystatic")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL("/admin-login", request.url);
      login.searchParams.set(
        "next",
        safeNextPath(pathname, isKeystaticProtected(pathname) ? "/keystatic" : "/area-admin"),
      );
      return NextResponse.redirect(login);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
