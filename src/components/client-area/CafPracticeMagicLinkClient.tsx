"use client";

import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

type MagicRequest = {
  requestId: number;
  customerName: string;
  email: string;
  phone: string;
  serviceLabel: string;
  categoryLabel: string;
  serviceScope: string;
  notes: string;
  customerFiles: Array<{
    originalName: string;
    downloadUrl: string;
  }>;
};

export default function CafPracticeMagicLinkClient() {
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || "").trim();
  const [requestData, setRequestData] = useState<MagicRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [operatorNotes, setOperatorNotes] = useState("");
  const [status, setStatus] = useState("completed");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) {
        setError("Token pratica mancante.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/caf-patronato/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ token }),
        });
        const payload = (await response.json()) as {
          request?: MagicRequest;
          message?: string;
        };

        if (!response.ok || !payload.request) {
          throw new Error(payload.message || "Link pratica non disponibile.");
        }

        if (!active) return;
        setRequestData(payload.request);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error ? loadError.message : "Link pratica non disponibile.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [token]);

  const headerLabel = useMemo(() => {
    if (!requestData) return "Presa in carico pratica";
    return `${requestData.serviceScope === "caf" ? "CAF" : "Patronato"} · ${requestData.serviceLabel}`;
  }, [requestData]);

  const appendFiles = (incoming: FileList | File[]) => {
    const nextFiles = Array.from(incoming).filter((file) => file.size > 0);
    if (!nextFiles.length) return;

    setFiles((current) => {
      const existing = new Set(current.map((file) => `${file.name}:${file.size}`));
      const merged = [...current];
      for (const file of nextFiles) {
        const key = `${file.name}:${file.size}`;
        if (!existing.has(key)) {
          merged.push(file);
          existing.add(key);
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

      const response = await fetch("/api/caf-patronato/magic-link", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Non riesco ad aggiornare la pratica.");
      }

      setMessage(payload.message || "Pratica aggiornata.");
      setFiles([]);
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
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          Sto aprendo i dettagli della pratica...
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-200">
          {error || "Link pratica non disponibile."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            {headerLabel}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Sto evadendo la pratica di {requestData.customerName}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Da qui posso chiudere la lavorazione, lasciare una nota e caricare i documenti finali
            che il cliente vedrà nello storico.
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
                Allegati iniziali del cliente
              </p>
              {requestData.customerFiles.length ? (
                <div className="mt-3 grid gap-2">
                  {requestData.customerFiles.map((file) => (
                    <a
                      key={file.downloadUrl}
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                    >
                      {file.originalName}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Nessun allegato iniziale presente.</p>
              )}
            </div>
            {requestData.notes ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Nota cliente
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{requestData.notes}</p>
              </div>
            ) : null}
          </div>
        </section>

        <form onSubmit={onSubmit} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Consegna al cliente
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Carico il documento evaso</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Il file caricato qui finisce nello storico pratiche del cliente senza altri passaggi.
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
              Trascino qui la pratica evasa oppure clicco per allegarla
            </span>
            <span className="mt-2 text-sm text-slate-400">
              Posso caricare uno o più file finali: pdf, scansioni, ricevute o documenti firmati.
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
                    onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                    className="ml-4 shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <label className="mt-5 block space-y-2">
            <span className="block text-sm font-medium text-slate-200">Nota per il cliente</span>
            <textarea
              value={operatorNotes}
              onChange={(event) => setOperatorNotes(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              rows={5}
              placeholder="Aggiungo un riepilogo utile: documenti consegnati, cosa controllare o eventuali prossimi passaggi."
            />
          </label>

          {message ? (
            <p className="mt-4 text-sm font-medium text-emerald-300">{message}</p>
          ) : null}
          {error ? <p className="mt-4 text-sm font-medium text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvataggio in corso..." : "Conferma evasione pratica"}
          </button>
        </form>
      </div>
    </div>
  );
}
