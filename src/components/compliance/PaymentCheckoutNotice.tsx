/**
 * Fact-forcing:
 * - Importers: GestiioPracticeWorkspace, OpenApiVisureWorkspace, SendWorkspace (payment CTAs).
 * - API/schema: none — presentational only; links to /diritti-consumatore.
 * - User instruction: "procedi su tutto al 100% non mancare niente chiudiamo questo GAP"
 *   (apply all compliance patches: payment clarity near CTA).
 */
import Link from "next/link";

type Props = {
  /** Importo già formattato, es. "15,00 €". Se assente mostra solo la formula one-shot. */
  amountLabel?: string;
  className?: string;
};

/** Testo obbligatorio vicino al CTA di pagamento: prezzo, no rinnovo, link recesso. */
export default function PaymentCheckoutNotice({ amountLabel, className = "" }: Props) {
  return (
    <p className={`text-xs leading-relaxed text-[var(--ink)]/55 ${className}`}>
      {amountLabel ? (
        <>
          Totale da pagare: <strong className="font-semibold text-[var(--ink)]/75">{amountLabel}</strong>
          {" · "}
        </>
      ) : null}
      Pagamento unico · nessun abbonamento né rinnovo automatico.{" "}
      <Link href="/diritti-consumatore" className="underline decoration-[var(--ink)]/25 underline-offset-2 hover:text-[#5E0ED7]">
        Diritti e recesso
      </Link>
    </p>
  );
}
