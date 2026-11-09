"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  target: string;
  initialData: unknown;
  title: string;
  description?: string;
  keystaticHref?: string;
};

export default function CmsJsonEditor({
  target,
  initialData,
  title,
  description,
  keystaticHref,
}: Props) {
  const router = useRouter();
  const [text, setText] = useState(() => JSON.stringify(initialData, null, 2));
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSave() {
    setStatus("saving");
    setMessage("");
    try {
      const parsed = JSON.parse(text) as unknown;
      const res = await fetch("/api/cms/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, data: parsed }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; hint?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Salvataggio non riuscito");
        if (json.hint) setMessage((m) => `${m} — ${json.hint}`);
        return;
      }
      setStatus("ok");
      setMessage("Salvato in content/");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "JSON non valido");
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Modifica</p>
      <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">{description}</p> : null}

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("idle");
        }}
        spellCheck={false}
        className="mt-8 min-h-[420px] w-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-4 font-mono text-xs leading-relaxed text-[var(--ink)] outline-none focus:border-[#5E0ED7]"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={status === "saving"}
          className="brutal-cta-ink bg-[var(--ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7] disabled:opacity-50"
        >
          {status === "saving" ? "Salvo…" : "Salva"}
        </button>
        {keystaticHref ? (
          <a
            href={keystaticHref}
            className="border border-[var(--ink)]/20 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Apri in Keystatic
          </a>
        ) : null}
        {message ? (
          <p className={`text-sm ${status === "error" ? "text-rose-700" : "text-[var(--ink)]/55"}`}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
