/**
 * Callers: PublicBookingDrawer success, deposito/fermo conferma, SendWorkspace success.
 * API/schema: none (UI link to /lascia-un-feedback).
 * User plan: “Micro-copy recensioni su conferme prenota/deposito/fermo/send”.
 */
import Link from "next/link";

type ReviewInviteProps = {
  tone?: "light" | "dark";
  className?: string;
};

export default function ReviewInvite({ tone = "dark", className = "" }: ReviewInviteProps) {
  const isDark = tone === "dark";
  return (
    <div
      className={`space-y-2 ${className} ${
        isDark ? "text-slate-400" : "text-[var(--ink)]/65"
      }`}
    >
      <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[var(--ink)]/65"}`}>
        Se l&apos;esperienza è andata bene, puoi raccontarlo su Google quando vuoi. Nessuna
        pressione: il feedback è libero.
      </p>
      <p className="text-sm">
        <Link
          href="/lascia-un-feedback"
          className={
            isDark
              ? "font-medium text-cyan-400 underline-offset-2 hover:underline"
              : "font-medium text-[#5E0ED7] underline-offset-2 hover:underline"
          }
        >
          Lascia un feedback
        </Link>
      </p>
    </div>
  );
}
