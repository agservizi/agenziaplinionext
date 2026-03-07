"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CafSignedDownloadClient() {
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || "").trim();
  const [message, setMessage] = useState("Sto preparando il download protetto...");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function startDownload() {
      if (!token) {
        setMessage("Link file non valido o incompleto.");
        return;
      }

      try {
        const response = await fetch("/api/client-area/caf-patronato/file-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || "Impossibile scaricare il file.");
        }

        const blob = await response.blob();
        const disposition = response.headers.get("Content-Disposition") || "";
        const filenameMatch = disposition.match(/filename=\"?([^"]+)\"?/i);
        const rawFilename = filenameMatch?.[1] || "documento";
        const filename = decodeURIComponent(rawFilename);

        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(objectUrl);
        setMessage("Download avviato. Se non parte automaticamente, aggiorna la pagina e riprova.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Impossibile avviare il download protetto.",
        );
      }
    }

    void startDownload();
  }, [token]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
        {message}
      </div>
    </div>
  );
}
