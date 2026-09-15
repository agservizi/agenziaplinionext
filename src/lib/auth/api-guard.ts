import { NextRequest, NextResponse } from "next/server";
import {
  STAFF_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  type PortalRole,
  canAccessAdminModule,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session";

type AdminModule = Parameters<typeof canAccessAdminModule>[1];

export function requireStaffSession(
  request: NextRequest,
  module: AdminModule,
): { session: SessionPayload } | { error: NextResponse } {
  const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, "staff");
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!canAccessAdminModule(session.role, module)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export function requireCustomerSession(
  request: NextRequest,
): { session: SessionPayload } | { error: NextResponse } {
  const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, "customer");
  if (!session || session.role !== "CUSTOMER") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export function assertRole(session: SessionPayload, roles: PortalRole[]) {
  return roles.includes(session.role);
}
