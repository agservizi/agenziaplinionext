"use client";

import { useEffect, useState } from "react";

type BrtShipmentHistoryItem = {
  id: number;
  requestId: number;
  trackingCode: string;
  parcelId: string;
  shipmentNumberFrom: string;
  shipmentNumberTo: string;
  createdAt: string;
  customerName: string;
  email: string;
  serviceType: string;
  status: string;
  destinationCompanyName: string;
  destinationCity: string;
  destinationCountry: string;
  parcelCount: number;
  actualWeightKG: number;
  volumetricWeightKG: number;
  volumeM3: number;
  paymentAmountCents: number;
  paymentCurrency: string;
  paymentStatus: string;
  checkoutStatus: string;
  priceLabel: string;
  invoiceStatus: string;
  invoicePdfUrl: string;
  manifestCreated: boolean;
  manifestMessage: string;
};

type BrtShipmentHistoryProps = {
  refreshToken: number;
};

export default function BrtShipmentHistory({ refreshToken }: BrtShipmentHistoryProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [shipments, setShipments] = useState<BrtShipmentHistoryItem[]>([]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setStatus("loading");
      setMessage("");

      try {
        const response = await fetch("/api/client-area/spedizioni/history", {
          method: "POST",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          shipments?: BrtShipmentHistoryItem[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.message || "Storico spedizioni non disponibile.");
        }

        if (!active) return;
        setShipments(Array.isArray(payload.shipments) ? payload.shipments : []);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Errore caricamento storico.");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [refreshToken]);

  return (
    <section className="lux-panel rounded-3xl p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Storico Spedizioni
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Le spedizioni gia registrate</h2>
          <p className="mt-2 text-sm text-slate-600">
            Qui trovi le ultime spedizioni create dal portale, con tracking, peso e stato pratica.
          </p>
        </div>
        {status === "ready" ? (
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {shipments.length} registrate
          </span>
        ) : null}
      </div>

      {status === "loading" ? <p className="mt-6 text-sm text-slate-500">Sto caricando lo storico...</p> : null}
      {status === "error" ? <p className="mt-6 text-sm font-medium text-red-600">{message}</p> : null}

      {status === "ready" && shipments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Non ci sono ancora spedizioni salvate. Appena ne crei una, la ritrovi subito qui sotto.
        </div>
      ) : null}

      {status === "ready" && shipments.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-300 w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Servizio</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Stato</th>
                <th className="px-4 py-3 font-semibold">Destinazione</th>
                <th className="px-4 py-3 font-semibold">Tracking</th>
                <th className="px-4 py-3 font-semibold">Parcel ID</th>
                <th className="px-4 py-3 font-semibold">Peso (kg)</th>
                <th className="px-4 py-3 font-semibold">Vol. (kg)</th>
                <th className="px-4 py-3 font-semibold">Volume (m3)</th>
                <th className="px-4 py-3 font-semibold">Pagamento</th>
                <th className="px-4 py-3 font-semibold">Importo</th>
                <th className="px-4 py-3 font-semibold">Fattura</th>
                <th className="px-4 py-3 font-semibold">Manifest</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3 font-semibold text-slate-900">{shipment.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {shipment.createdAt
                      ? new Date(shipment.createdAt).toLocaleString("it-IT")
                      : "n/d"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.serviceType || "n/d"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{shipment.customerName || "n/d"}</p>
                    <p className="text-xs text-slate-500">{shipment.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.status || "new"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {shipment.destinationCity || "n/d"}
                    {shipment.destinationCountry ? ` (${shipment.destinationCountry})` : ""}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.trackingCode || "n/d"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.parcelId || "n/d"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.actualWeightKG || 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.volumetricWeightKG || 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{shipment.volumeM3 || 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {shipment.paymentStatus || shipment.checkoutStatus || "n/d"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {shipment.paymentAmountCents
                      ? `${(shipment.paymentAmountCents / 100).toFixed(2).replace(".", ",")} ${shipment.paymentCurrency.toUpperCase()}`
                      : "n/d"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p>{shipment.invoiceStatus || "in preparazione"}</p>
                    {shipment.invoicePdfUrl ? (
                      <a
                        href={shipment.invoicePdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-xs font-semibold text-cyan-700"
                      >
                        Apri PDF
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">
                      {shipment.manifestCreated ? "Generato" : "Da verificare"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 max-w-55">
                      {shipment.manifestMessage || "Nessun dettaglio disponibile."}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
