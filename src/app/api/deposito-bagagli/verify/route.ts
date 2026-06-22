import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://coresuite.it/api/public/deposito-bagagli";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_PARAM", message: "Il parametro 'token' è obbligatorio." } },
        { status: 400 },
      );
    }

    const res = await fetch(`${API_BASE}/verify?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Servizio non disponibile." } },
      { status: 502 },
    );
  }
}
