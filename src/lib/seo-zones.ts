/**
 * Callers: /zone pages + sitemap. Schema: zone slug -> local SEO copy.
 * User plan: SEO 100% zone landings.
 */
export type SeoZone = {
  slug: string;
  name: string;
  provinceHint: string;
  intro: string;
  servicesFocus: { title: string; href: string; blurb: string }[];
};

export const seoZones: SeoZone[] = [
  {
    slug: "castellammare-di-stabia",
    name: "Castellammare di Stabia",
    provinceHint: "NA",
    intro:
      "Siamo in Via Plinio il Vecchio 72: pagamenti, SPID, PEC, spedizioni, energia, telefonia e web. Un solo sportello, dal 2016.",
    servicesFocus: [
      { title: "SPID e PEC", href: "/servizi/digitali/spid", blurb: "Attivazione in sede, documenti alla mano." },
      { title: "PagoPA e bollettini", href: "/servizi/pagamenti/pagopa", blurb: "Paghi qui senza girare per uffici." },
      { title: "Spedizioni", href: "/servizi/logistica/spedizioni-nazionali", blurb: "Etichetta, ritiro e tracking." },
      { title: "Deposito bagagli", href: "/deposito-bagagli", blurb: "Prenota online e lascia le valigie in agenzia." },
    ],
  },
  {
    slug: "gragnano",
    name: "Gragnano",
    provinceHint: "NA",
    intro:
      "Da Gragnano ci raggiungi in pochi minuti. Stesso NAP, stessi servizi: SPID, pagamenti, luce/gas e spedizioni.",
    servicesFocus: [
      { title: "SPID", href: "/servizi/digitali/spid", blurb: "Attiva lo SPID senza spostarti a Napoli." },
      { title: "Energia", href: "/servizi/energia", blurb: "Confronto bollette e cambio fornitore." },
      { title: "Telefonia", href: "/servizi/telefonia", blurb: "Iliad, Fastweb, Ho. e Digi in sede." },
      { title: "Prenota", href: "/prenota", blurb: "Scegli lo slot e vieni preparato." },
    ],
  },
  {
    slug: "pompei",
    name: "Pompei",
    provinceHint: "NA",
    intro:
      "Se sei a Pompei e ti serve un’agenzia multiservizi vicino, AG SERVIZI a Castellammare copre SPID, pacchi, PagoPA e deposito bagagli.",
    servicesFocus: [
      { title: "Deposito bagagli", href: "/deposito-bagagli", blurb: "Utile se visiti gli scavi e vuoi liberare le mani." },
      { title: "Spedizioni", href: "/servizi/logistica/spedizioni-nazionali", blurb: "Pacco pronto, etichetta e tracking." },
      { title: "PagoPA", href: "/servizi/pagamenti/pagopa", blurb: "Bollettini e avvisi in pochi minuti." },
      { title: "SEND", href: "/send", blurb: "Avvisi digitali e pratiche assistite." },
    ],
  },
  {
    slug: "torre-annunziata",
    name: "Torre Annunziata",
    provinceHint: "NA",
    intro:
      "Da Torre Annunziata raggiungiamo Via Plinio 72 facilmente. Qui trovi pagamenti, pratiche digitali e consulenza utenze.",
    servicesFocus: [
      { title: "Bollettini e F24", href: "/servizi/pagamenti", blurb: "Pagamenti quotidiani senza code inutili." },
      { title: "Firma digitale", href: "/servizi/digitali/firma-digitale", blurb: "Partner Namirial, supporto in sede." },
      { title: "Luce e gas", href: "/servizi/energia", blurb: "Enel, A2A, Fastweb Energia e altre offerte." },
      { title: "Contatti", href: "/contatti", blurb: "Telefono, WhatsApp o passa in sede." },
    ],
  },
  {
    slug: "vico-equense",
    name: "Vico Equense",
    provinceHint: "NA",
    intro:
      "Per chi arriva da Vico Equense: sportello unico per SPID, PEC, spedizioni e consulenza telefonica/energia.",
    servicesFocus: [
      { title: "PEC", href: "/servizi/digitali/pec", blurb: "Attivazione e rinnovo con assistenza." },
      { title: "Fermo deposito", href: "/fermo-deposito", blurb: "Custodia pacchi da 0,50€ al giorno." },
      { title: "Web Agency", href: "/web-agency", blurb: "Siti e gestionali per attività locali." },
      { title: "Prenota", href: "/prenota", blurb: "Fissa l’appuntamento prima di scendere." },
    ],
  },
  {
    slug: "piano-di-sorrento",
    name: "Piano di Sorrento",
    provinceHint: "NA",
    intro:
      "Da Piano di Sorrento puoi fare affidamento su AG SERVIZI a Castellammare per pratiche digitali, pagamenti e logistica.",
    servicesFocus: [
      { title: "SPID e PEC", href: "/servizi/spid-pec-firma-digitale", blurb: "Identità digitale senza stress." },
      { title: "Spedizioni internazionali", href: "/servizi/logistica/spedizioni-internazionali", blurb: "Documenti e tracking estero." },
      { title: "Consulenza", href: "/consulenza", blurb: "Telefonia ed energia spiegate chiaro." },
      { title: "Recensioni", href: "/recensioni", blurb: "Cosa dicono i clienti su Google." },
    ],
  },
];

export function getSeoZoneBySlug(slug: string) {
  return seoZones.find((z) => z.slug === slug) ?? null;
}
