/**
 * Callers: Keystatic CMS UI at /keystatic.
 * API: /api/keystatic/[...params] — wrapped with requireStaffSession("cms").
 * Schema: none. User: procedi con tutto al 100%
 */
import { NextRequest } from "next/server";
import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { requireStaffSession } from "@/lib/auth/api-guard";

const handlers = makeRouteHandler({ config });

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "cms");
  if ("error" in auth) return auth.error;
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "cms");
  if ("error" in auth) return auth.error;
  return handlers.POST(request);
}
