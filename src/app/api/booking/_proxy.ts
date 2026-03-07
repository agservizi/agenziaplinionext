import { NextRequest, NextResponse } from "next/server";

function normalizeBase(input: string) {
  return input.replace(/\/+$/, "");
}

function buildCandidateBases(request: NextRequest) {
  const configured = normalizeBase(String(process.env.NEXT_PUBLIC_BOOKING_API_BASE || ""));
  const localBackend = normalizeBase(String(process.env.BOOKING_BACKEND_URL || "http://localhost:3001"));
  const allowRemoteFallbackInDev =
    String(process.env.BOOKING_DEV_FALLBACK_REMOTE || "").toLowerCase() === "true";
  const host = request.nextUrl.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const fallbackProduction = "https://agenziaplinio.it";
  const candidates: string[] = [];

  if (isLocalhost) {
    candidates.push(localBackend);
    if (!allowRemoteFallbackInDev) {
      return Array.from(new Set(candidates)).filter(Boolean);
    }
  }
  if (configured) {
    candidates.push(configured);
  }
  if (!configured) {
    candidates.push(fallbackProduction);
  }

  return Array.from(new Set(candidates)).filter(Boolean);
}

export async function proxyBookingRequest(
  request: NextRequest,
  path: string,
  init?: RequestInit,
) {
  const candidates = buildCandidateBases(request);
  let lastError: unknown = null;
  let lastBase = "";

  for (const base of candidates) {
    lastBase = base;
    try {
      const response = await fetch(`${base}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(init?.headers || {}),
        },
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await response.json().catch(() => ({}));
        const nextResponse = NextResponse.json(payload, { status: response.status });
        nextResponse.headers.set("x-booking-upstream", base);
        return nextResponse;
      }

      const text = await response.text().catch(() => "");
      const nextResponse = NextResponse.json(
        {
          message: text || "Risposta non valida dal servizio prenotazioni.",
        },
        { status: response.status },
      );
      nextResponse.headers.set("x-booking-upstream", base);
      return nextResponse;
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Booking proxy error", lastError);
  return NextResponse.json(
    {
      message: "Servizio prenotazioni non raggiungibile.",
      details:
        request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1"
          ? `Verifica che il backend sia avviato su ${candidates[0] || "http://localhost:3001"}.`
          : undefined,
      attemptedUpstream: lastBase || null,
    },
    { status: 503 },
  );
}
