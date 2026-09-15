import { NextRequest } from "next/server";
import { enforcePortalAuth } from "@/lib/auth/portal-guard";

export default function proxy(request: NextRequest) {
  return enforcePortalAuth(request);
}

export const config = {
  matcher: ["/area-clienti/:path*", "/area-admin/:path*"],
};
