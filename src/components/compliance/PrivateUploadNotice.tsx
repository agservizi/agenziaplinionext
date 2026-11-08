/**
 * Fact-forcing:
 * - Importers: TicketPraticheWorkspace, SendWorkspace, CafPatronatoRequestForm,
 *   VisuraPracticeMagicLinkClient, CafPracticeMagicLinkClient (upload UIs).
 * - API/schema: none — presentational; links to /segnala-contenuto (DSA).
 * - User instruction: "procedi su tutto al 100% non mancare niente chiudiamo questo GAP"
 */
import Link from "next/link";

type Props = {
  className?: string;
};

/** Nota DSA / privacy sotto gli upload: file privati allo staff + canale segnalazione. */
export default function PrivateUploadNotice({ className = "" }: Props) {
  return (
    <p className={`text-xs leading-relaxed text-[var(--ink)]/50 ${className}`}>
      I file restano privati allo staff e non vengono pubblicati sul sito. Carica solo materiali
      di cui hai diritto. Per segnalare un contenuto illecito usa{" "}
      <Link
        href="/segnala-contenuto"
        className="underline decoration-[var(--ink)]/25 underline-offset-2 hover:text-[#5E0ED7]"
      >
        Segnala contenuto
      </Link>
      .
    </p>
  );
}
