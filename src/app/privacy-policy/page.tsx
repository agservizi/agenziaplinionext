import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Privacy Policy | AG SERVIZI",
    description:
      "Informativa privacy AG SERVIZI: trattamento dati, cookie e consenso secondo GDPR.",
    path: "/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="lux-surface pb-24 pt-10 text-slate-900">
      <Container className="space-y-8">
        <div className="lux-panel rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Informativa Privacy</h1>
          <p className="mt-3 text-sm text-slate-600">
            Questa informativa descrive il trattamento dei dati personali secondo il GDPR (UE 2016/679)
            e fa riferimento alle attività connesse all’uso di cookie e strumenti di tracciamento.
          </p>
        </div>

        <div className="lux-panel rounded-3xl p-8">
          <h2 className="text-lg font-semibold text-slate-900">Cookie e consensi</h2>
          <p className="mt-2 text-sm text-slate-600">
            I cookie tecnici sono necessari al funzionamento del sito. Gli altri cookie vengono attivati
            solo dopo consenso esplicito. Puoi modificare o revocare il consenso in qualsiasi momento tramite
            la sezione “Gestisci cookie”.
          </p>
        </div>
      </Container>
    </div>
  );
}
