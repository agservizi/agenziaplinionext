"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type CheckoutPayload = {
  url?: string;
  message?: string;
  pageCount?: number;
  unitPriceCents?: number;
  amountCents?: number;
};

export default function PhotocopyWorkspace() {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Castellammare di Stabia");
  const [notes, setNotes] = useState("");
  const [residentConfirmed, setResidentConfirmed] = useState(false);
  const [pickupConfirmed, setPickupConfirmed] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!pdfFile) {
        throw new Error("Carica un file PDF prima di procedere.");
      }

      const payload = new FormData();
      payload.append("customerName", customerName);
      payload.append("email", email);
      payload.append("phone", phone);
      payload.append("city", city);
      payload.append("notes", notes);
      payload.append("residentConfirmed", residentConfirmed ? "1" : "0");
      payload.append("pickupConfirmed", pickupConfirmed ? "1" : "0");
      payload.append("pdfFile", pdfFile);

      const response = await fetch("/api/client-area/fotocopie/checkout", {
        method: "POST",
        body: payload,
      });

      const json = (await response.json()) as CheckoutPayload;
      if (!response.ok) {
        throw new Error(json.message || "Checkout non avviato.");
      }

      if (!json.url) {
        throw new Error("URL checkout Stripe non disponibile.");
      }

      window.location.href = json.url;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Errore durante l'avvio del pagamento.");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="lux-card rounded-3xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Servizio attivo</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Fotocopie online con ritiro in sede</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Carichi il PDF, il sistema conta automaticamente le pagine e calcola il totale. Dopo il
          pagamento Stripe riceviamo l&apos;ordine in tempo reale per la stampa.
        </p>

        <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
          <p className="text-sm font-semibold text-cyan-950">Regole del servizio</p>
          <ul className="mt-3 space-y-2 text-sm text-cyan-900">
            <li>• Minimo 20 pagine, massimo 500 pagine per ordine</li>
            <li>• Solo residenti a Castellammare di Stabia</li>
            <li>• Consegna ordine: ritiro in agenzia AG SERVIZI</li>
          </ul>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Fasce prezzo</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• 20-100 pagine: 0,10 € / pagina</li>
            <li>• 101-200 pagine: 0,07 € / pagina</li>
            <li>• 201-500 pagine: 0,05 € / pagina</li>
          </ul>
        </div>

        <Link
          href="/area-clienti"
          className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Torna alla dashboard
        </Link>
      </div>

      <form onSubmit={onSubmit} className="lux-card rounded-3xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Nuovo ordine</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Carica il PDF e procedi al pagamento</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Nome e cognome
            </span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Telefono
            </span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Città di residenza
            </span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              PDF da stampare
            </span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Note (opzionale)
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              placeholder="Es. stampa fronte/retro, eventuali istruzioni"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={residentConfirmed}
              onChange={(event) => setResidentConfirmed(event.target.checked)}
              required
              className="mt-0.5 h-4 w-4"
            />
            <span>Confermo di essere residente a Castellammare di Stabia.</span>
          </label>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={pickupConfirmed}
              onChange={(event) => setPickupConfirmed(event.target.checked)}
              required
              className="mt-0.5 h-4 w-4"
            />
            <span>Confermo il ritiro in agenzia AG SERVIZI (nessuna spedizione disponibile).</span>
          </label>
        </div>

        {status === "error" ? <p className="mt-4 text-sm font-medium text-red-600">{message}</p> : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Calcolo pagine e avvio checkout..." : "Procedi al pagamento"}
        </button>
      </form>
    </div>
  );
}
