import Container from "@/components/Container";
import { cookieCategories, cookiePolicy } from "@/lib/cookies";
import { buildMetadata } from "@/lib/seo";

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
    <div className="lux-surface pb-24 pt-10 text-slate-900">
      <Container className="space-y-10">
        <div className="lux-panel rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Cookie Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Gestione cookie</h1>
          <p className="mt-3 text-sm text-slate-600">
            Ultimo aggiornamento: {cookiePolicy.lastUpdated}. Versione policy: {cookiePolicy.version}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cookieCategories.map((category) => (
            <div key={category.key} className="lux-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {category.label}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            </div>
          ))}
        </div>

        <div className="lux-panel rounded-3xl p-8">
          <h3 className="text-lg font-semibold text-slate-900">Cookie utilizzati</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {cookiePolicy.cookies.map((cookie) => (
              <div key={cookie.name} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{cookie.name}</p>
                <p>Finalità: {cookie.purpose}</p>
                <p>Durata: {cookie.duration}</p>
                <p>Provider: {cookie.provider}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
