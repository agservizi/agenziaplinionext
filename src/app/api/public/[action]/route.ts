import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeBase(input: string) {
  return input.replace(/\/+$/, "");
}

function resolveUpstreamBase() {
  const configured = normalizeBase(
    String(process.env.NEXT_PUBLIC_BOOKING_API_BASE || "https://agenziaplinio.it"),
  );

  return configured || "https://agenziaplinio.it";
}

async function proxyPublicRequest(request: NextRequest, action: string) {
  const upstreamBase = resolveUpstreamBase();
  const search = request.nextUrl.search || "";
  const url = `${upstreamBase}/api/public/${encodeURIComponent(action)}${search}`;

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: {
        Accept: "application/json",
        "Content-Type": request.headers.get("content-type") || "application/json",
      },
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.text(),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => ({}));
      const nextResponse = NextResponse.json(payload, { status: response.status });
      nextResponse.headers.set("x-public-upstream", upstreamBase);
      return nextResponse;
    }

    const text = await response.text().catch(() => "");
    const nextResponse = NextResponse.json(
      { message: text || "Risposta non valida dal servizio pubblico." },
      { status: response.status },
    );
    nextResponse.headers.set("x-public-upstream", upstreamBase);
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Servizio pubblico non raggiungibile.",
        details: error instanceof Error ? error.message : undefined,
        attemptedUpstream: upstreamBase,
      },
      { status: 503 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  return proxyPublicRequest(request, action);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  return proxyPublicRequest(request, action);
}
