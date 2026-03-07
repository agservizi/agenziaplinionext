import { NextResponse } from "next/server";
import { getMissingBrtConfig, routeBrtShipment } from "@/lib/brt-shipment";
import { resolveShippingPrice } from "@/lib/shipping-pricing-engine";

export const runtime = "nodejs";

function requireString(value: unknown) {
  return String(value || "").trim();
}

function requirePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getServiceCountryValidationMessage(serviceCode: string, destinationCountry: string) {
  if (serviceCode === "ritiro-nazionale" && destinationCountry !== "IT") {
    return "Per 'Spedizione nazionale' la destinazione deve essere IT.";
  }
  if (serviceCode === "ritiro-internazionale" && destinationCountry === "IT") {
    return "Per 'Spedizione internazionale' la destinazione deve essere diversa da IT.";
  }
  return "";
}

export async function POST(request: Request) {
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      { message: `Configurazione BRT incompleta: ${missing.join(", ")}.` },
      { status: 503 },
    );
  }

  const body = await request.json();
  const payload = {
    destinationCompanyName: requireString(body?.destinationCompanyName),
    destinationAddress: requireString(body?.destinationAddress),
    destinationZIPCode: requireString(body?.destinationZIPCode),
    destinationCity: requireString(body?.destinationCity),
    destinationProvince: requireString(body?.destinationProvince).toUpperCase(),
    destinationCountry: requireString(body?.destinationCountry || "IT").toUpperCase(),
    pudoId: requireString(body?.pudoId),
    parcelCount: requirePositiveNumber(body?.parcelCount),
    parcelLengthCM: requirePositiveNumber(body?.parcelLengthCM),
    parcelHeightCM: requirePositiveNumber(body?.parcelHeightCM),
    parcelDepthCM: requirePositiveNumber(body?.parcelDepthCM),
    weightKG: requirePositiveNumber(body?.weightKG),
    serviceCode: requireString(body?.serviceCode || "ritiro-nazionale"),
  };
  const volumeCM3 =
    payload.parcelLengthCM * payload.parcelHeightCM * payload.parcelDepthCM * payload.parcelCount;
  const volumeM3 = Number((volumeCM3 / 1_000_000).toFixed(4));
  const volumetricWeightKG = Number((volumeCM3 / 4000).toFixed(2));
  const taxableWeightKG = Math.max(payload.weightKG, volumetricWeightKG);

  if (
    !payload.destinationCompanyName ||
    !payload.destinationAddress ||
    !payload.destinationZIPCode ||
    !payload.destinationCity ||
    !payload.destinationProvince ||
    !payload.parcelCount ||
    !payload.parcelLengthCM ||
    !payload.parcelHeightCM ||
    !payload.parcelDepthCM ||
    !payload.weightKG
  ) {
    return NextResponse.json(
      { message: "Compila i dati minimi per il routing BRT." },
      { status: 400 },
    );
  }

  const serviceCountryError = getServiceCountryValidationMessage(
    payload.serviceCode,
    payload.destinationCountry,
  );
  if (serviceCountryError) {
    return NextResponse.json({ message: serviceCountryError }, { status: 400 });
  }

  try {
    await resolveShippingPrice(taxableWeightKG, volumeM3, payload.destinationCountry, {
      strict: true,
    });
    const result = await routeBrtShipment({
      ...payload,
      volumeM3,
    });
    return NextResponse.json(
      {
        message: "Instradamento BRT disponibile.",
        arrivalTerminal: result.arrivalTerminal,
        arrivalDepot: result.arrivalDepot,
        deliveryZone: result.deliveryZone,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore durante il routing della spedizione.";
    const isShippingLimitExceeded =
      message.includes("non consente spedizioni con peso/volume") ||
      message.includes("non consente spedizioni con peso superiore");
    return NextResponse.json(
      {
        message,
        errorCode: isShippingLimitExceeded ? "SHIPPING_LIMIT_EXCEEDED" : undefined,
      },
      { status: isShippingLimitExceeded ? 409 : 502 },
    );
  }
}
