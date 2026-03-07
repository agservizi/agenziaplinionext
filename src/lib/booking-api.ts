export type BookingServiceOption = {
  value: string;
  label: string;
  description: string;
};

export const BOOKING_SERVICE_OPTIONS: BookingServiceOption[] = [
  {
    value: "Consulenza telefonia",
    label: "Consulenza telefonia",
    description: "Analizziamo offerte, attivazioni e consumi per la linea più adatta.",
  },
  {
    value: "Consulenza energia",
    label: "Consulenza energia",
    description: "Rivediamo luce e gas per ridurre costi e inefficienze.",
  },
  {
    value: "Servizi digitali",
    label: "Servizi digitali",
    description: "Supporto per SPID, PEC, firma digitale e pratiche online.",
  },
  {
    value: "Spedizioni assistite",
    label: "Spedizioni assistite",
    description: "Ti guidiamo su spedizioni, etichette e flussi logistici.",
  },
  {
    value: "Pratiche CAF e Patronato",
    label: "Pratiche CAF e Patronato",
    description: "Ci organizziamo per ISEE, 730, pensioni e pratiche dedicate.",
  },
  {
    value: "Web Agency",
    label: "Web Agency",
    description: "Valutiamo sito, gestionale o progetto digitale su misura.",
  },
];

const PRODUCTION_BOOKING_BASES = new Set([
  "https://agenziaplinio.it",
  "https://www.agenziaplinio.it",
]);

export function resolveBookingApiBase(hostname?: string) {
  const configuredBase = String(process.env.NEXT_PUBLIC_BOOKING_API_BASE || "").replace(/\/$/, "");
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const pointsToProduction = PRODUCTION_BOOKING_BASES.has(configuredBase);

  if (isLocalhost && (!configuredBase || pointsToProduction)) {
    return "";
  }

  return configuredBase;
}

export function buildBookingApiUrl(path: string, hostname?: string) {
  const base = resolveBookingApiBase(hostname);
  if (!base) return "";
  return `${base}${path}`;
}

export function resolveClientBookingApiBase() {
  if (typeof window === "undefined") {
    return resolveBookingApiBase();
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return window.location.origin;
  }

  return resolveBookingApiBase(hostname);
}
