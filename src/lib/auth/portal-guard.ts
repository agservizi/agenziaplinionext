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

function isStaffProtected(pathname: string) {
  return pathname === "/area-admin" || pathname.startsWith("/area-admin/");
}

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

  if (isStaffProtected(pathname)) {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = verifySessionToken(token, "staff");
    if (!session) {
      const bridge = new URL("/auth/bridge", request.url);
      bridge.searchParams.set("kind", "staff");
      bridge.searchParams.set("next", safeNextPath(pathname, "/area-admin"));
      return NextResponse.redirect(bridge);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
