import { config, fields, collection, singleton } from "@keystatic/core";

const githubConfigured = Boolean(
  process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET &&
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
);

const githubRepo = process.env.KEYSTATIC_GITHUB_REPO || "carva/agenziaplinio.it";

/**
 * Keystatic content schema for AG SERVIZI public site.
 * Callers: /keystatic UI, /api/keystatic, Reader adapters, Brutal /area-admin.
 * User: Implement CMS Keystatic Brutal plan.
 */
export default config({
  storage: githubConfigured
    ? {
        kind: "github" as const,
        repo: {
          owner: githubRepo.split("/")[0] || "owner",
          name: githubRepo.split("/")[1] || "repo",
        },
      }
    : { kind: "local" as const },
  singletons: {
    siteSettings: singleton({
      label: "Impostazioni sito",
      path: "content/site-settings",
      format: { data: "json" },
      schema: {
        companyName: fields.text({ label: "Nome" }),
        legalName: fields.text({ label: "Ragione sociale" }),
        address: fields.text({ label: "Indirizzo", multiline: true }),
        vat: fields.text({ label: "P. IVA" }),
        sdi: fields.text({ label: "SDI" }),
        openedYear: fields.integer({ label: "Anno apertura" }),
        openedMonth: fields.integer({ label: "Mese apertura" }),
        openedDay: fields.integer({ label: "Giorno apertura" }),
        phone: fields.text({ label: "Telefono" }),
        whatsapp: fields.text({ label: "WhatsApp" }),
        googleBusinessUrl: fields.text({ label: "Google Business URL" }),
        marqueeItems: fields.array(fields.text({ label: "Voce" }), {
          label: "Marquee",
          itemLabel: (props) => props.value || "Voce",
        }),
        openingHours: fields.array(
          fields.object({
            day: fields.text({ label: "Giorno" }),
            hours: fields.text({ label: "Orario" }),
          }),
          { label: "Orari", itemLabel: (props) => props.fields.day.value || "Giorno" },
        ),
        navigation: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.text({ label: "Href" }),
          }),
          { label: "Navigazione", itemLabel: (props) => props.fields.label.value || "Link" },
        ),
        values: fields.array(
          fields.object({
            title: fields.text({ label: "Titolo" }),
            description: fields.text({ label: "Descrizione", multiline: true }),
          }),
          { label: "Valori", itemLabel: (props) => props.fields.title.value || "Valore" },
        ),
        serviceCategories: fields.array(
          fields.object({
            id: fields.text({ label: "ID" }),
            title: fields.text({ label: "Titolo" }),
            subtitle: fields.text({ label: "Sottotitolo", multiline: true }),
            icon: fields.select({
              label: "Icona",
              options: [
                { label: "Pagamenti", value: "payments" },
                { label: "Telefonia", value: "phone" },
                { label: "Energia", value: "energy" },
                { label: "Logistica", value: "logistics" },
                { label: "Digital", value: "digital" },
                { label: "Web", value: "web" },
              ],
              defaultValue: "payments",
            }),
            items: fields.array(
              fields.object({
                title: fields.text({ label: "Titolo" }),
                description: fields.text({ label: "Descrizione", multiline: true }),
              }),
              { label: "Voci", itemLabel: (props) => props.fields.title.value || "Voce" },
            ),
          }),
          { label: "Categorie servizi", itemLabel: (props) => props.fields.title.value || "Categoria" },
        ),
      },
    }),
    homePage: singleton({
      label: "Home",
      path: "content/home-page",
      format: { data: "json" },
      schema: {
        headingWords: fields.array(fields.text({ label: "Parola" }), {
          label: "Parole hero",
          itemLabel: (props) => props.value || "Parola",
        }),
        tagline: fields.text({ label: "Tagline", multiline: true }),
        description: fields.text({ label: "Descrizione", multiline: true }),
        ctaText: fields.text({ label: "CTA testo" }),
        ctaHref: fields.text({ label: "CTA link" }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: "Valore (numero o 'years')" }),
            label: fields.text({ label: "Etichetta", multiline: true }),
          }),
          { label: "Stats", itemLabel: (props) => props.fields.label.value || "Stat" },
        ),
        seoTitle: fields.text({ label: "SEO title" }),
        seoDescription: fields.text({ label: "SEO description", multiline: true }),
      },
    }),
  },
  collections: {
    faqs: collection({
      label: "FAQ",
      slugField: "question",
      path: "content/faqs/*",
      format: { data: "json" },
      schema: {
        question: fields.slug({ name: { label: "Domanda" } }),
        answer: fields.text({ label: "Risposta", multiline: true }),
        order: fields.integer({ label: "Ordine", defaultValue: 0 }),
      },
    }),
    reviews: collection({
      label: "Recensioni",
      slugField: "name",
      path: "content/reviews/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({ name: { label: "Nome" } }),
        initials: fields.text({ label: "Iniziali" }),
        color: fields.text({ label: "Classe colore (Tailwind)" }),
        rating: fields.integer({ label: "Stelle", defaultValue: 5 }),
        text: fields.text({ label: "Testo", multiline: true }),
        order: fields.integer({ label: "Ordine", defaultValue: 0 }),
      },
    }),
    services: collection({
      label: "Servizi",
      slugField: "title",
      path: "content/services/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Titolo" } }),
        category: fields.select({
          label: "Categoria",
          options: [
            { label: "Telefonia", value: "telefonia" },
            { label: "Energia", value: "energia" },
            { label: "Digitali", value: "digitali" },
            { label: "Pagamenti", value: "pagamenti" },
            { label: "Logistica", value: "logistica" },
            { label: "Web Agency", value: "web-agency" },
          ],
          defaultValue: "telefonia",
        }),
        shortDescription: fields.text({ label: "Descrizione breve", multiline: true }),
        heroDescription: fields.text({ label: "Hero", multiline: true }),
        customerBenefits: fields.array(fields.text({ label: "Benefit" }), {
          label: "Benefici",
          itemLabel: (props) => props.value?.slice(0, 40) || "Benefit",
        }),
        requiredInfo: fields.array(fields.text({ label: "Documento" }), {
          label: "Documenti richiesti",
          itemLabel: (props) => props.value?.slice(0, 40) || "Doc",
        }),
        notes: fields.array(fields.text({ label: "Nota" }), {
          label: "Note",
          itemLabel: (props) => props.value?.slice(0, 40) || "Nota",
        }),
        officialSources: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            url: fields.text({ label: "URL" }),
          }),
          { label: "Fonti ufficiali", itemLabel: (props) => props.fields.label.value || "Fonte" },
        ),
      },
    }),
  },
});
