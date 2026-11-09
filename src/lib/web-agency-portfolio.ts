/**
 * Callers: WebAgencyPortfolioPreview, WebAgencyLavoriPage, WebAgencyCaseStudy,
 * lavori/[slug] generateStaticParams.
 * Schema: PortfolioProject (slug, demoPath relative or absolute https).
 * User: "Implement the plan… portfolio web-agency" — replace 6 legacy with Zampaluna/Velavia/Nuvera.
 */
export type PortfolioCategory =
  | "Landing"
  | "Sito vetrina"
  | "E-commerce"
  | "Piattaforma"
  | "Dashboard";

export type PortfolioProject = {
  slug: string;
  title: string;
  client: string;
  category: PortfolioCategory;
  year: number;
  summary: string;
  challenge: string;
  approach: string;
  results: string[];
  stack: string[];
  cover: string;
  gallery: string[];
  featured: boolean;
  /** Path relativo (/demos/…) o URL assoluto https (es. Nuvera). */
  demoPath: string;
  demoReady: boolean;
  sourceCredit?: { name: string; url: string };
};

/** Demo live Nuvera (Bagisto/Next esterno). Override: NEXT_PUBLIC_NUVERA_DEMO_URL */
export const NUVERA_EXTERNAL_DEMO_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_NUVERA_DEMO_URL?.trim()) ||
  "https://nuvera-casa.agenziaplinio.it";

const portfolioProjects: PortfolioProject[] = [
  {
    slug: "zampaluna",
    title: "Pet shop con toelettatura e ornitologia",
    client: "Zampaluna",
    category: "Sito vetrina",
    year: 2026,
    summary:
      "Vetrina immersiva per un pet shop di quartiere: servizi, atmosfera e percorso chiaro verso il negozio.",
    challenge:
      "Serviva una demo presentabile al cliente senza CMS né backend: brand forte, motion e contenuti locali, niente dati reali.",
    approach:
      "HTML statico con tipografia e motion curate (GSAP, Lenis, Three), foto e font locali, noindex, percorso visitatore pensato per lo showroom in sede.",
    results: [
      "Demo navigabile offline-friendly",
      "Identità verde/crema coerente su mobile e desktop",
      "Presentazione cliente senza dipendenze server",
    ],
    stack: ["HTML", "CSS", "GSAP", "Lenis", "Three.js"],
    cover: "/images/web-agency/portfolio/zampaluna-cover.png",
    gallery: [
      "/images/web-agency/portfolio/zampaluna-cover.png",
      "/images/web-agency/portfolio/zampaluna-alt.jpg",
    ],
    featured: true,
    demoPath: "/demos/zampaluna/index.html",
    demoReady: true,
    sourceCredit: {
      name: "AG SERVIZI Web Agency · demo Zampaluna",
      url: "/web-agency",
    },
  },
  {
    slug: "velavia",
    title: "Boutique bomboniere e richieste evento",
    client: "Velàvia",
    category: "Sito vetrina",
    year: 2026,
    summary:
      "Atelier digitale avorio/bordeaux: ispirazioni per occasione, richiesta guidata simulata e presentazione demo dedicata.",
    challenge:
      "La boutique voleva mostrare il tono del brand e un flusso preventivo senza inviare dati: catalogo ispirazionale e modulo dimostrativo.",
    approach:
      "Build statica in dist/ con presentazione /demo.html, filtri occasione, fiocco Three.js e simulazione richiesta con riepilogo/PDF lato browser.",
    results: [
      "Percorso showroom + prova richiesta in un click",
      "Asset e font locali, noindex",
      "Modulo senza invio remoto (solo simulazione)",
    ],
    stack: ["HTML", "CSS", "GSAP", "Lenis", "Three.js"],
    cover: "/images/web-agency/portfolio/velavia-cover.png",
    gallery: [
      "/images/web-agency/portfolio/velavia-cover.png",
      "/images/web-agency/portfolio/velavia-alt.jpg",
    ],
    featured: true,
    demoPath: "/demos/velavia/index.html",
    demoReady: true,
    sourceCredit: {
      name: "AG SERVIZI Web Agency · demo Velàvia",
      url: "/web-agency",
    },
  },
  {
    slug: "nuvera-casa",
    title: "Shop casa collegato al gestionale",
    client: "Nuvèra Casa",
    category: "E-commerce",
    year: 2026,
    summary:
      "Vetrina Next con catalogo, carrello e area cliente collegati a Bagisto: demo live su host dedicato.",
    challenge:
      "Serviva uno shop reale (non solo mock) con motore ordini, senza montare Bagisto dentro il sito agenzia.",
    approach:
      "App Next standalone sul dominio demo esterno; case study e cover sul sito AG SERVIZI, CTA verso la demo live.",
    results: [
      "Catalogo e checkout demo su stack dedicato",
      "Separazione chiara sito marketing vs shop operativo",
      "Case study e portfolio allineati sul brand agenzia",
    ],
    stack: ["Next.js", "React", "Bagisto", "GSAP", "Lenis"],
    cover: "/images/web-agency/portfolio/nuvera-casa-cover.jpg",
    gallery: [
      "/images/web-agency/portfolio/nuvera-casa-cover.jpg",
      "/images/web-agency/portfolio/nuvera-casa-alt.jpg",
    ],
    featured: true,
    demoPath: NUVERA_EXTERNAL_DEMO_URL,
    demoReady: true,
    sourceCredit: {
      name: "AG SERVIZI Web Agency · demo Nuvèra Casa",
      url: "/web-agency",
    },
  },
];

export function getPortfolioProjects() {
  return portfolioProjects;
}

export function getFeaturedProjects(limit = 5) {
  return portfolioProjects.filter((p) => p.featured).slice(0, limit);
}

export function getPortfolioProjectBySlug(slug: string) {
  return portfolioProjects.find((p) => p.slug === slug) ?? null;
}

export function getPortfolioCategories(): PortfolioCategory[] {
  return [...new Set(portfolioProjects.map((p) => p.category))];
}

export function getPortfolioSlugs() {
  return portfolioProjects.map((p) => p.slug);
}

export function isExternalDemoPath(path: string) {
  return /^https?:\/\//i.test(path);
}
