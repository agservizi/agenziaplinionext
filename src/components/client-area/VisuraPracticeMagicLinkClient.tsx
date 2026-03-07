"use client";

import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

type MagicRequest = {
  requestId: number;
  customerName: string;
  email: string;
  phone: string;
  serviceLabel: string;
  status: string;
  notes: string;
  createdAt: string | null;
  amountLabel: string;
  priceLabel: string;
  existingDocumentUrl: string;
};

export default function VisuraPracticeMagicLinkClient() {
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || "").trim();
  const [requestData, setRequestData] = useState<MagicRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("completed");
  const [operatorNotes, setOperatorNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) {
        setError("Token pratica mancante.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/client-area/visure/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ token }),
        });
        const payload = (await response.json()) as { request?: MagicRequest; message?: string };
        if (!response.ok || !payload.request) {
          throw new Error(payload.message || "Magic link non disponibile.");
        }

        if (!active) return;
        setRequestData(payload.request);
        setStatus(payload.request.status === "completed" ? "completed" : "processing");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Magic link non disponibile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [token]);

  const appendFiles = (incoming: FileList | File[]) => {
    const nextFiles = Array.from(incoming).filter((file) => file.size > 0);
    if (!nextFiles.length) return;

    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}:${file.size}`));
      const merged = [...current];
      for (const file of nextFiles) {
        const key = `${file.name}:${file.size}`;
        if (!seen.has(key)) {
          merged.push(file);
          seen.add(key);
        }
      }
      return merged;
    });
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    appendFiles(event.dataTransfer.files);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const body = new FormData();
      body.set("token", token);
      body.set("status", status);
      body.set("operatorNotes", operatorNotes);
      for (const file of files) {
        body.append("files", file);
      }

      const response = await fetch("/api/client-area/visure/magic-link", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as { message?: string; documentUrl?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Non riesco ad aggiornare la pratica.");
      }

      setMessage(payload.message || "Pratica aggiornata.");
      setFiles([]);
      setRequestData((current) =>
        current
          ? {
              ...current,
              status,
              existingDocumentUrl: payload.documentUrl || current.existingDocumentUrl,
            }
          : current,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Non riesco ad aggiornare la pratica.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          Sto aprendo la pratica visura...
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-200">
          {error || "Magic link non disponibile."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Backoffice visure
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Evasione pratica #{requestData.requestId}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Da qui puoi completare manualmente la richiesta e pubblicare il documento nello
            storico del cliente senza mostrargli errori di provider.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Cliente
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{requestData.customerName}</p>
              <p className="mt-1 text-sm text-slate-300">{requestData.email}</p>
              <p className="mt-1 text-sm text-slate-400">{requestData.phone || "Telefono non indicato"}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Servizio
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{requestData.serviceLabel}</p>
              <p className="mt-1 text-sm text-slate-400">
                {requestData.amountLabel || requestData.priceLabel || "Importo non disponibile"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {requestData.createdAt
                  ? new Date(requestData.createdAt).toLocaleString("it-IT")
                  : "Data non disponibile"}
              </p>
            </div>
            {requestData.notes ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Nota del cliente
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{requestData.notes}</p>
              </div>
            ) : null}
            {requestData.existingDocumentUrl ? (
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  Documento gia caricato
                </p>
                <a
                  href={requestData.existingDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-emerald-100"
                >
                  Apri documento attuale
                </a>
              </div>
            ) : null}
          </div>
        </section>

        <form onSubmit={onSubmit} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Consegna al cliente
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Allego il documento finale</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Il file caricato qui finisce nello storico visure del cliente e potra essere scaricato
            direttamente dall&apos;area riservata.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-200">Esito pratica</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              >
                <option value="completed">Evasa</option>
                <option value="processing">In lavorazione</option>
                <option value="waiting-documents">In attesa documenti</option>
              </select>
            </label>
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={onDrop}
            className={`mt-5 flex cursor-pointer flex-col rounded-3xl border border-dashed px-5 py-6 transition ${
              dragActive
                ? "border-cyan-300 bg-cyan-400/10"
                : "border-white/15 bg-slate-950/30 hover:border-cyan-300 hover:bg-cyan-400/5"
            }`}
          >
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(event) => appendFiles(event.target.files || [])}
            />
            <span className="text-sm font-semibold text-white">
              Trascina qui il documento evaso oppure clicca per allegarlo
            </span>
            <span className="mt-2 text-sm text-slate-400">
              Se chiudi la pratica come evasa, serve almeno un documento finale.
            </span>
          </label>

          {files.length ? (
            <div className="mt-4 grid gap-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-slate-100">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((_, currentIndex) => currentIndex !== index),
                      )
                    }
                    className="ml-4 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-red-300 hover:text-red-200"
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <label className="mt-5 block space-y-2">
            <span className="block text-sm font-medium text-slate-200">Nota operatore</span>
            <textarea
              value={operatorNotes}
              onChange={(event) => setOperatorNotes(event.target.value)}
              rows={5}
              placeholder="Note interne o istruzioni di evasione..."
              className="w-full rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            />
          </label>

          {error ? <p className="mt-4 text-sm font-medium text-red-300">{error}</p> : null}
          {message ? <p className="mt-4 text-sm font-medium text-emerald-300">{message}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Sto salvando..." : "Salva e aggiorna lo storico"}
          </button>
        </form>
      </div>
    </div>
  );
}
