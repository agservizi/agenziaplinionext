import { NextResponse } from "next/server";
import { getOpenApiVisureCatalog } from "@/lib/openapi-visure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Callers: OpenApiVisureWorkspace (POST action=catalog).
 * Schema: OpenApiCatalogResult from @/lib/openapi-visure.
 * Overrides next.config rewrite to PHP :8089 when this App Router route exists.
 * User: "controlliamo tutti i servizi connessi perche dice Value is not JSON serializable"
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "request").trim();

  if (action === "catalog") {
    try {
      const catalog = await getOpenApiVisureCatalog();
      return NextResponse.json(catalog);
    } catch (error) {
      return NextResponse.json(
        {
          sandbox: false,
          services: [],
          message:
            error instanceof Error && error.message
              ? error.message
              : "Catalogo OpenAPI visure non disponibile.",
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(
    {
      message:
        "Per completare la richiesta visura usa il checkout Stripe e lo storico. L’endpoint di creazione pratica resta sul backend PHP in produzione.",
    },
    { status: 501 },
  );
}
