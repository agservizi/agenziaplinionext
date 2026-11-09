/**
 * Fact-forcing: public cookie policy; list thirdPartyOptional (Spline/GA) after consent.
 * User: "procedi su tutto al 100% non mancare niente chiudiamo questo GAP".
 */
import Container from "@/components/Container";
import { cookieCategories, cookiePolicy } from "@/lib/cookies";
import { buildMetadata } from "@/lib/seo";
import { company } from "@/lib/site-data";

export function generateMetadata() {
  return buildMetadata({
    title: "Cookie Policy | AG SERVIZI",
    description:
      "Informativa cookie AG SERVIZI: categorie, durata e finalità dei cookie utilizzati.",
    path: "/cookie-policy",
  });
}

export default function CookiePolicyPage() {
  return (
    <div className="bg-[var(--paper)] pb-20 pt-20 text-[var(--ink)]">
      <Container className="space-y-10">
        <div className="lux-panel rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Cookie Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Gestione cookie</h1>
          <p className="mt-3 text-sm text-[var(--ink)]/65">
            Ultimo aggiornamento: {cookiePolicy.lastUpdated}. Versione policy: {cookiePolicy.version}.
          </p>
        </div>

        <div className="lux-panel rounded-3xl p-8">
          <div className="space-y-4 text-sm leading-7 text-[var(--ink)]/65">
            <p>
              Questa Cookie Policy descrive l’utilizzo dei cookie e di strumenti simili sul sito di{" "}
              <strong>{company.legalName}</strong>, con sede in <strong>{company.address}</strong>.
            </p>
            <p>
              I cookie sono piccoli file di testo che il sito salva sul dispositivo dell’utente per
              garantire il corretto funzionamento delle pagine, memorizzare preferenze, raccogliere
              statistiche e, dove previsto dal consenso, supportare attività di marketing o
              personalizzazione.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cookieCategories.map((category) => (
            <div key={category.key} className="lux-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                {category.label}
              </h2>
              <p className="mt-2 text-sm text-[var(--ink)]/65">{category.description}</p>
            </div>
          ))}
        </div>

        <div className="lux-panel rounded-3xl p-8">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Cookie utilizzati</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--ink)]/65">
            {cookiePolicy.cookies.map((cookie) => (
              <div key={cookie.name} className="rounded-2xl border border-[var(--ink)]/15 p-4">
                <p className="font-semibold text-[var(--ink)]">{cookie.name}</p>
                <p>Finalità: {cookie.purpose}</p>
                <p>Durata: {cookie.duration}</p>
                <p>Provider: {cookie.provider}</p>
              </div>
            ))}
          </div>
        </div>

        {cookiePolicy.thirdPartyOptional?.length ? (
          <div className="lux-panel rounded-3xl p-8">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Risorse di terzi (solo dopo consenso)
            </h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--ink)]/65">
              {cookiePolicy.thirdPartyOptional.map((item) => (
                <div key={item.name} className="rounded-2xl border border-[var(--ink)]/15 p-4">
                  <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                  <p>Finalità: {item.purpose}</p>
                  <p>Provider: {item.provider}</p>
                  <p>Categoria consenso: {item.category}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="lux-panel rounded-3xl p-8">
          <div className="space-y-6 text-sm leading-7 text-[var(--ink)]/65">
            <section>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Gestione del consenso</h2>
              <p className="mt-2">
                I cookie tecnici necessari sono sempre attivi perché indispensabili al funzionamento
                del sito. Le altre categorie vengono attivate solo dopo il consenso espresso
                dall’utente tramite il banner cookie o il pannello di gestione preferenze.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Come modificare le preferenze</h2>
              <p className="mt-2">
                L’utente può aggiornare, modificare o revocare il consenso in qualsiasi momento
                attraverso il comando “Gestisci cookie” presente nel sito. È inoltre possibile
                intervenire dalle impostazioni del browser per limitare, bloccare o cancellare i
                cookie già memorizzati.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Cookie di terze parti</h2>
              <p className="mt-2">
                Alcuni strumenti integrati nel sito possono coinvolgere servizi di terze parti,
                come piattaforme di analisi, tracciamento, pagamenti o servizi operativi. In questi
                casi l’uso dei cookie dipende anche dalle policy dei rispettivi fornitori.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Contatti</h2>
              <p className="mt-2">
                Per informazioni sul trattamento dei dati personali e sull’uso dei cookie, è
                possibile fare riferimento anche alla{" "}
                <a href="/privacy-policy" className="font-semibold text-cyan-700 hover:text-cyan-600">
                  Privacy Policy
                </a>{" "}
                del sito.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
