export type SeasonalHeroTheme = {
  badgeClass: string;
  badgeTextClass: string;
  accentTextClass: string;
  ghostNumberClass: string;
  primaryButtonClass: string;
  secondaryButtonClass: string;
  chipClass: string;
  cardClass: string;
  panelClass: string;
  panelInnerClass: string;
  statClass: string;
  overlayClass: string;
};

export type SeasonalHeroConfig = {
  key: string;
  priority: number;
  type: "single_day" | "date_range" | "movable";
  month?: number;
  day?: number;
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;
  year?: number;
  title: string;
  description: string;
  badge: string;
  label: string;
  chips: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  panelEyebrow: string;
  panelTitle: string;
  panelBody: string;
  panelStats: Array<{ value: string; label: string }>;
  panelNote: string;
  heroNumber: string;
  theme: SeasonalHeroTheme;
};

export type ResolvedSeasonalHeroConfig = SeasonalHeroConfig & {
  badge: string;
  description: string;
  panelBody: string;
  panelStats: Array<{ value: string; label: string }>;
};

function getEasterDate(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

export function getRomeDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "0"),
    day: Number(parts.find((part) => part.type === "day")?.value ?? "0"),
  };
}

const goldTheme: SeasonalHeroTheme = {
  badgeClass: "border-amber-300/35 bg-amber-400/10",
  badgeTextClass: "text-amber-200",
  accentTextClass: "text-amber-300",
  ghostNumberClass: "text-white/6",
  primaryButtonClass:
    "bg-amber-400 text-slate-950 shadow-[0_14px_32px_rgba(251,191,36,0.35)] hover:-translate-y-0.5 hover:bg-amber-300",
  secondaryButtonClass:
    "border-white/20 bg-white/5 text-white hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-200",
  chipClass: "border-white/12 bg-white/6 text-slate-100",
  cardClass:
    "border-amber-300/18 bg-[linear-gradient(180deg,rgba(30,41,59,0.76),rgba(15,23,42,0.92))] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(120,53,15,0.35)]",
  panelClass:
    "border-amber-300/16 bg-[linear-gradient(145deg,rgba(120,53,15,0.22)_0%,rgba(71,31,9,0.14)_18%,rgba(15,23,42,0.82)_52%,rgba(15,23,42,0.92)_100%)] shadow-[0_30px_80px_rgba(120,53,15,0.22)]",
  panelInnerClass:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(120,53,15,0.07)_18%,rgba(15,23,42,0.2)_58%,rgba(15,23,42,0.12)_100%)]",
  statClass: "border-amber-200/20 bg-slate-950/35 text-amber-200",
  overlayClass:
    "bg-[radial-gradient(720px_420px_at_16%_18%,rgba(251,191,36,0.16),rgba(251,191,36,0.08)_24%,rgba(251,191,36,0.03)_42%,transparent_68%),radial-gradient(620px_360px_at_84%_16%,rgba(245,158,11,0.14),rgba(245,158,11,0.06)_24%,rgba(245,158,11,0.02)_40%,transparent_66%),radial-gradient(900px_420px_at_50%_8%,rgba(255,255,255,0.035),transparent_62%)]",
};

const tricolorTheme: SeasonalHeroTheme = {
  badgeClass: "border-emerald-300/30 bg-emerald-400/10",
  badgeTextClass: "text-emerald-200",
  accentTextClass: "text-emerald-300",
  ghostNumberClass: "text-white/5",
  primaryButtonClass:
    "bg-emerald-400 text-slate-950 shadow-[0_14px_32px_rgba(52,211,153,0.32)] hover:-translate-y-0.5 hover:bg-emerald-300",
  secondaryButtonClass:
    "border-white/20 bg-white/5 text-white hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-200",
  chipClass: "border-white/12 bg-white/6 text-slate-100",
  cardClass:
    "border-emerald-300/16 bg-[linear-gradient(180deg,rgba(2,44,34,0.42),rgba(15,23,42,0.92))] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,95,70,0.32)]",
  panelClass:
    "border-emerald-300/15 bg-[linear-gradient(145deg,rgba(4,120,87,0.18)_0%,rgba(15,23,42,0.84)_52%,rgba(127,29,29,0.14)_100%)] shadow-[0_30px_80px_rgba(6,95,70,0.18)]",
  panelInnerClass:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(4,120,87,0.08)_22%,rgba(15,23,42,0.18)_58%,rgba(127,29,29,0.08)_100%)]",
  statClass: "border-emerald-200/20 bg-slate-950/35 text-emerald-200",
  overlayClass:
    "bg-[radial-gradient(700px_420px_at_16%_18%,rgba(52,211,153,0.14),rgba(52,211,153,0.05)_24%,transparent_66%),radial-gradient(760px_420px_at_84%_14%,rgba(248,113,113,0.12),rgba(248,113,113,0.04)_26%,transparent_66%),radial-gradient(900px_420px_at_50%_8%,rgba(255,255,255,0.03),transparent_62%)]",
};

const blueTheme: SeasonalHeroTheme = {
  badgeClass: "border-sky-300/35 bg-sky-400/10",
  badgeTextClass: "text-sky-200",
  accentTextClass: "text-sky-300",
  ghostNumberClass: "text-white/6",
  primaryButtonClass:
    "bg-sky-400 text-slate-950 shadow-[0_14px_32px_rgba(56,189,248,0.34)] hover:-translate-y-0.5 hover:bg-sky-300",
  secondaryButtonClass:
    "border-white/20 bg-white/5 text-white hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-200",
  chipClass: "border-white/12 bg-white/6 text-slate-100",
  cardClass:
    "border-sky-300/18 bg-[linear-gradient(180deg,rgba(8,47,73,0.42),rgba(15,23,42,0.92))] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,47,73,0.32)]",
  panelClass:
    "border-sky-300/16 bg-[linear-gradient(145deg,rgba(8,47,73,0.22)_0%,rgba(15,23,42,0.82)_58%,rgba(30,58,138,0.16)_100%)] shadow-[0_30px_80px_rgba(8,47,73,0.22)]",
  panelInnerClass:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(14,165,233,0.08)_18%,rgba(15,23,42,0.2)_60%,rgba(30,58,138,0.08)_100%)]",
  statClass: "border-sky-200/20 bg-slate-950/35 text-sky-200",
  overlayClass:
    "bg-[radial-gradient(720px_420px_at_18%_18%,rgba(56,189,248,0.15),rgba(56,189,248,0.06)_24%,transparent_66%),radial-gradient(620px_360px_at_84%_16%,rgba(59,130,246,0.13),rgba(59,130,246,0.04)_24%,transparent_66%),radial-gradient(900px_420px_at_50%_8%,rgba(255,255,255,0.03),transparent_62%)]",
};

const redTheme: SeasonalHeroTheme = {
  badgeClass: "border-rose-300/35 bg-rose-400/10",
  badgeTextClass: "text-rose-200",
  accentTextClass: "text-rose-300",
  ghostNumberClass: "text-white/6",
  primaryButtonClass:
    "bg-rose-400 text-slate-950 shadow-[0_14px_32px_rgba(251,113,133,0.34)] hover:-translate-y-0.5 hover:bg-rose-300",
  secondaryButtonClass:
    "border-white/20 bg-white/5 text-white hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-200",
  chipClass: "border-white/12 bg-white/6 text-slate-100",
  cardClass:
    "border-rose-300/18 bg-[linear-gradient(180deg,rgba(127,29,29,0.34),rgba(15,23,42,0.92))] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(127,29,29,0.3)]",
  panelClass:
    "border-rose-300/16 bg-[linear-gradient(145deg,rgba(127,29,29,0.24)_0%,rgba(15,23,42,0.82)_56%,rgba(190,24,93,0.12)_100%)] shadow-[0_30px_80px_rgba(127,29,29,0.22)]",
  panelInnerClass:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(251,113,133,0.08)_18%,rgba(15,23,42,0.2)_58%,rgba(190,24,93,0.07)_100%)]",
  statClass: "border-rose-200/20 bg-slate-950/35 text-rose-200",
  overlayClass:
    "bg-[radial-gradient(720px_420px_at_18%_18%,rgba(251,113,133,0.15),rgba(251,113,133,0.05)_24%,transparent_66%),radial-gradient(620px_360px_at_84%_16%,rgba(244,63,94,0.12),rgba(244,63,94,0.04)_24%,transparent_66%),radial-gradient(900px_420px_at_50%_8%,rgba(255,255,255,0.03),transparent_62%)]",
};

const springTheme: SeasonalHeroTheme = {
  badgeClass: "border-lime-300/35 bg-lime-400/10",
  badgeTextClass: "text-lime-200",
  accentTextClass: "text-lime-300",
  ghostNumberClass: "text-white/6",
  primaryButtonClass:
    "bg-lime-400 text-slate-950 shadow-[0_14px_32px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 hover:bg-lime-300",
  secondaryButtonClass:
    "border-white/20 bg-white/5 text-white hover:-translate-y-0.5 hover:border-lime-300 hover:text-lime-200",
  chipClass: "border-white/12 bg-white/6 text-slate-100",
  cardClass:
    "border-lime-300/18 bg-[linear-gradient(180deg,rgba(63,98,18,0.28),rgba(15,23,42,0.92))] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(77,124,15,0.28)]",
  panelClass:
    "border-lime-300/16 bg-[linear-gradient(145deg,rgba(77,124,15,0.18)_0%,rgba(15,23,42,0.82)_52%,rgba(34,197,94,0.1)_100%)] shadow-[0_30px_80px_rgba(77,124,15,0.18)]",
  panelInnerClass:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(163,230,53,0.08)_18%,rgba(15,23,42,0.2)_58%,rgba(34,197,94,0.06)_100%)]",
  statClass: "border-lime-200/20 bg-slate-950/35 text-lime-200",
  overlayClass:
    "bg-[radial-gradient(720px_420px_at_16%_18%,rgba(163,230,53,0.14),rgba(163,230,53,0.05)_24%,transparent_66%),radial-gradient(620px_360px_at_84%_16%,rgba(34,197,94,0.12),rgba(34,197,94,0.04)_24%,transparent_66%),radial-gradient(900px_420px_at_50%_8%,rgba(255,255,255,0.03),transparent_62%)]",
};

export const seasonalHeroConfigs: SeasonalHeroConfig[] = [
  {
    key: "new-year",
    priority: 100,
    type: "single_day",
    month: 1,
    day: 1,
    badge: "1 gennaio | Nuovo anno",
    label: "Capodanno",
    title: "Iniziamo il nuovo anno accanto a te.",
    description:
      "Anche nel nuovo anno siamo qui per aiutarti con servizi utili, supporto concreto e un punto di riferimento affidabile per le tue esigenze quotidiane.",
    chips: ["Nuovo anno", "Supporto continuo", "Servizi essenziali"],
    primaryCtaLabel: "Inizia dai servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Contattaci",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Capodanno",
    panelTitle: "Anche il primo giorno dell'anno puoi contare su di noi.",
    panelBody:
      "Se stai ripartendo con nuovi obiettivi, pratiche da gestire o servizi da attivare, noi siamo qui per accompagnarti con chiarezza e continuita.",
    panelStats: [
      { value: "1", label: "gennaio" },
      { value: "2026", label: "nuovo anno" },
      { value: "Sempre", label: "presenza" },
    ],
    panelNote: "Ti auguriamo un anno piu semplice, piu ordinato e con un supporto concreto ogni volta che ne hai bisogno.",
    heroNumber: "01",
    theme: goldTheme,
  },
  {
    key: "epiphany",
    priority: 100,
    type: "single_day",
    month: 1,
    day: 6,
    badge: "6 gennaio | Epifania",
    label: "Epifania",
    title: "Anche nei giorni di festa restiamo vicini alle tue esigenze.",
    description:
      "L'Epifania chiude il periodo delle feste, ma il nostro impegno resta lo stesso: aiutarti con servizi chiari, utili e vicini alla tua quotidianita.",
    chips: ["Epifania", "Presenza locale", "Supporto concreto"],
    primaryCtaLabel: "Scopri i servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Parla con noi",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Ricorrenza",
    panelTitle: "Le feste finiscono, il nostro supporto resta.",
    panelBody:
      "Se per te gennaio e il momento in cui riparti davvero, puoi contare su un'agenzia presente, concreta e pronta ad aiutarti nelle scelte di ogni giorno.",
    panelStats: [
      { value: "6", label: "gennaio" },
      { value: "Festa", label: "tradizione" },
      { value: "Reale", label: "supporto" },
    ],
    panelNote: "Anche in una giornata simbolica, il messaggio resta semplice: siamo qui per esserti utili davvero.",
    heroNumber: "06",
    theme: blueTheme,
  },
  {
    key: "saint-catello",
    priority: 105,
    type: "single_day",
    month: 1,
    day: 19,
    badge: "19 gennaio | San Catello",
    label: "San Catello",
    title: "Nel giorno di San Catello ti accompagniamo con rispetto e vicinanza.",
    description:
      "Il 19 gennaio dedichiamo un messaggio a una ricorrenza sentita a Castellammare di Stabia, mantenendo un tono sobrio, vicino alle persone e coerente con l'identita dell'agenzia.",
    chips: ["San Catello", "Castellammare di Stabia", "Presenza locale"],
    primaryCtaLabel: "Scopri i servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Contattaci",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Ricorrenza locale",
    panelTitle: "Un messaggio dedicato alla comunita stabiese nel giorno del suo patrono.",
    panelBody:
      "In questa giornata vogliamo rivolgerci a te con una presenza piu raccolta e rispettosa, continuando a offrirti supporto concreto sui servizi di ogni giorno.",
    panelStats: [
      { value: "19", label: "gennaio" },
      { value: "San Catello", label: "patrono" },
      { value: "Locale", label: "ricorrenza" },
    ],
    panelNote:
      "Per noi significa valorizzare una data importante per il territorio, con un tono chiaro e vicino alle persone.",
    heroNumber: "19",
    theme: blueTheme,
  },
  {
    key: "easter",
    priority: 110,
    type: "movable",
    badge: "Pasqua | Una ricorrenza di primavera",
    label: "Pasqua",
    title: "Ti auguriamo una Pasqua di serenita e ripartenza.",
    description:
      "Pasqua e un momento che parla di rinnovo e continuita. Anche per questo vogliamo essere per te una presenza affidabile, chiara e vicina.",
    chips: ["Pasqua", "Primavera", "Vicini alle persone"],
    primaryCtaLabel: "Vai ai servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Contattaci",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Pasqua",
    panelTitle: "Una festa che parla di equilibrio, fiducia e ripartenza.",
    panelBody:
      "Nel tempo della Pasqua vogliamo trasmetterti lo stesso approccio con cui lavoriamo tutto l'anno: attenzione, ascolto e supporto concreto.",
    panelStats: [
      { value: "Pasqua", label: "ricorrenza" },
      { value: "Primavera", label: "stagione" },
      { value: "Cura", label: "approccio" },
    ],
    panelNote: "Un augurio semplice e diretto: che questo tempo porti piu serenita, chiarezza e continuita anche nella tua quotidianita.",
    heroNumber: "P",
    theme: springTheme,
  },
  {
    key: "liberation-day",
    priority: 100,
    type: "single_day",
    month: 4,
    day: 25,
    badge: "25 aprile | Festa della Liberazione",
    label: "25 Aprile",
    title: "Oggi vogliamo ricordare una ricorrenza importante per tutti.",
    description:
      "Il 25 aprile e una giornata dal forte valore civile. La raccontiamo con rispetto, sobrieta e attenzione, come presenza istituzionale verso chi visita il sito.",
    chips: ["Memoria", "Valore civile", "Ricorrenza nazionale"],
    primaryCtaLabel: "Scopri l'agenzia",
    primaryCtaHref: "/chi-siamo",
    secondaryCtaLabel: "Esplora i servizi",
    secondaryCtaHref: "/servizi",
    panelEyebrow: "Ricorrenza nazionale",
    panelTitle: "Una ricorrenza che merita rispetto e misura.",
    panelBody:
      "Oggi scegliamo una presenza piu sobria per ricordare una data importante per il Paese, mantenendo un tono coerente e rispettoso anche nella comunicazione online.",
    panelStats: [
      { value: "25", label: "aprile" },
      { value: "Italia", label: "ricorrenza" },
      { value: "Civile", label: "significato" },
    ],
    panelNote: "E il nostro modo per dirti che anche la comunicazione puo fermarsi un attimo, con rispetto, davanti a una data che conta.",
    heroNumber: "25",
    theme: tricolorTheme,
  },
  {
    key: "labour-day",
    priority: 100,
    type: "single_day",
    month: 5,
    day: 1,
    badge: "1 maggio | Festa dei Lavoratori",
    label: "1 Maggio",
    title: "Il lavoro conta davvero, ogni giorno.",
    description:
      "Il 1 maggio e una ricorrenza che sentiamo vicina: anche il nostro lavoro nasce dalla continuita, dalla presenza e dal rapporto diretto con le persone.",
    chips: ["Lavoro", "Continuita", "Presenza quotidiana"],
    primaryCtaLabel: "Scopri i servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Contattaci",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Festa dei Lavoratori",
    panelTitle: "Anche per noi il lavoro ha valore quando e utile alle persone.",
    panelBody:
      "Ogni giorno lavoriamo per offrirti un supporto concreto, servizi chiari e una presenza affidabile: il 1 maggio e anche un'occasione per ricordartelo.",
    panelStats: [
      { value: "1", label: "maggio" },
      { value: "Lavoro", label: "valore" },
      { value: "Ogni giorno", label: "impegno" },
    ],
    panelNote: "Il nostro messaggio per oggi e semplice: serieta, continuita e attenzione alle esigenze reali.",
    heroNumber: "1",
    theme: redTheme,
  },
  {
    key: "republic-day",
    priority: 120,
    type: "single_day",
    month: 6,
    day: 2,
    badge: "2 giugno | Festa della Repubblica",
    label: "2 Giugno",
    title: "Oggi celebriamo una ricorrenza importante per il Paese.",
    description:
      "Il 2 giugno entra con una presenza dedicata, istituzionale e rispettosa, pensata per chi visita il sito in questa giornata simbolica.",
    chips: ["Repubblica", "Ricorrenza nazionale", "Tono istituzionale"],
    primaryCtaLabel: "Scopri l'agenzia",
    primaryCtaHref: "/chi-siamo",
    secondaryCtaLabel: "Vai ai servizi",
    secondaryCtaHref: "/servizi",
    panelEyebrow: "Festa della Repubblica",
    panelTitle: "Una giornata da riconoscere con rispetto e misura.",
    panelBody:
      "Anche attraverso questo messaggio vogliamo segnare il valore del 2 giugno con un tono sobrio, ordinato e coerente con l'identita dell'agenzia.",
    panelStats: [
      { value: "2", label: "giugno" },
      { value: "Italia", label: "identita" },
      { value: "Istituzionale", label: "tono" },
    ],
    panelNote: "E il nostro modo per rivolgerti un messaggio istituzionale, semplice e rispettoso in una data che conta.",
    heroNumber: "02",
    theme: tricolorTheme,
  },
  {
    key: "anniversary-june-2026",
    priority: 60,
    type: "date_range",
    startMonth: 6,
    startDay: 1,
    endMonth: 6,
    endDay: 30,
    year: 2026,
    badge: "Giugno 2016 - Giugno 2026 | 10 anni di attività",
    label: "Anniversario",
    title: "Accanto alle persone, ogni giorno.",
    description:
      "Da dieci anni siamo al tuo fianco con servizi utili, presenza reale e supporto continuo, in agenzia e online, per accompagnarti nelle esigenze di ogni giorno.",
    chips: ["10 anni di attività", "Supporto in sede e online", "Servizi per privati e imprese"],
    primaryCtaLabel: "Festeggia con noi",
    primaryCtaHref: "#anniversary-panel",
    secondaryCtaLabel: "Scopri i nostri 10 anni",
    secondaryCtaHref: "/chi-siamo",
    panelEyebrow: "Anniversario AG SERVIZI",
    panelTitle: "Dieci anni trascorsi accanto a chi si affida a noi.",
    panelBody:
      "Giugno 2026 segna un traguardo importante: dieci anni di lavoro, ascolto e presenza costruiti insieme alle persone, alle famiglie e alle imprese che ci hanno scelto.",
    panelStats: [
      { value: "2016", label: "partenza" },
      { value: "10", label: "anni" },
      { value: "Giugno", label: "mese celebrativo" },
    ],
    panelNote:
      "Per noi questo anniversario ha valore soprattutto perche racconta il rapporto costruito nel tempo con chi entra in agenzia o ci sceglie online.",
    heroNumber: "10",
    theme: goldTheme,
  },
  {
    key: "ferragosto",
    priority: 100,
    type: "single_day",
    month: 8,
    day: 15,
    badge: "15 agosto | Ferragosto",
    label: "Ferragosto",
    title: "Anche nel cuore dell'estate restiamo un punto di riferimento.",
    description:
      "Ferragosto porta un'atmosfera piu leggera, ma il nostro messaggio resta lo stesso: vicinanza, chiarezza e presenza quando ti serve un supporto concreto.",
    chips: ["Ferragosto", "Estate", "Presenza costante"],
    primaryCtaLabel: "Vai ai servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Contattaci",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Ferragosto",
    panelTitle: "Un giorno d'estate, con la stessa affidabilita di sempre.",
    panelBody:
      "Anche in una giornata simbolica dell'estate vogliamo trasmetterti un'idea semplice: puoi continuare a riconoscere in noi una presenza seria e vicina.",
    panelStats: [
      { value: "15", label: "agosto" },
      { value: "Estate", label: "stagione" },
      { value: "Luce", label: "mood" },
    ],
    panelNote: "Una hero estiva pensata per parlarti con piu luce e leggerezza, senza perdere il nostro stile.",
    heroNumber: "15",
    theme: goldTheme,
  },
  {
    key: "all-saints",
    priority: 100,
    type: "single_day",
    month: 11,
    day: 1,
    badge: "1 novembre | Ognissanti",
    label: "1 Novembre",
    title: "Oggi scegliamo una presenza piu raccolta e sobria.",
    description:
      "Il 1 novembre entra con un tono piu misurato, pensato per accompagnarti con rispetto anche in una ricorrenza dal carattere piu raccolto.",
    chips: ["Ognissanti", "Tono sobrio", "Presenza rispettosa"],
    primaryCtaLabel: "Scopri l'agenzia",
    primaryCtaHref: "/chi-siamo",
    secondaryCtaLabel: "Vai ai servizi",
    secondaryCtaHref: "/servizi",
    panelEyebrow: "1 Novembre",
    panelTitle: "Un messaggio piu discreto, ma sempre vicino alle persone.",
    panelBody:
      "In questa giornata preferiamo una presenza piu essenziale, che sappia accompagnarti con rispetto e continuita senza alzare il tono.",
    panelStats: [
      { value: "1", label: "novembre" },
      { value: "Sobrio", label: "tono" },
      { value: "Rispetto", label: "presenza" },
    ],
    panelNote: "Anche questa e una forma di attenzione: adattare il tono del messaggio alla sensibilita della giornata.",
    heroNumber: "01",
    theme: blueTheme,
  },
  {
    key: "immaculate-conception",
    priority: 100,
    type: "single_day",
    month: 12,
    day: 8,
    badge: "8 dicembre | Immacolata",
    label: "8 Dicembre",
    title: "Inizia il periodo piu luminoso dell'anno.",
    description:
      "L'8 dicembre apre un'atmosfera diversa: piu calda, piu luminosa, ma sempre chiara e coerente con il modo in cui ti parliamo ogni giorno.",
    chips: ["Immacolata", "Atmosfera natalizia", "Eleganza visiva"],
    primaryCtaLabel: "Scopri i servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Parla con noi",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "Immacolata",
    panelTitle: "Una giornata che segna l'inizio del clima natalizio.",
    panelBody:
      "Con questa hero vogliamo accompagnarti verso un periodo piu festivo, mantenendo la stessa attenzione alla chiarezza, alla leggibilita e al tono del brand.",
    panelStats: [
      { value: "8", label: "dicembre" },
      { value: "Natale", label: "avvicinamento" },
      { value: "Luce", label: "mood" },
    ],
    panelNote: "Per te significa trovare un sito piu vivo e piu vicino al momento dell'anno, senza perdere ordine e riconoscibilita.",
    heroNumber: "08",
    theme: blueTheme,
  },
  {
    key: "christmas",
    priority: 130,
    type: "single_day",
    month: 12,
    day: 25,
    badge: "25 dicembre | Natale",
    label: "Natale",
    title: "In questo giorno di festa vogliamo esserti vicini con semplicita.",
    description:
      "A Natale il messaggio diventa piu caldo e accogliente, ma resta fedele a cio che per noi conta davvero: presenza umana, chiarezza e affidabilita.",
    chips: ["Natale", "Vicini alle persone", "Atmosfera calda"],
    primaryCtaLabel: "Scopri l'agenzia",
    primaryCtaHref: "/chi-siamo",
    secondaryCtaLabel: "Esplora i servizi",
    secondaryCtaHref: "/servizi",
    panelEyebrow: "25 Dicembre",
    panelTitle: "Un messaggio piu caldo, senza perdere autenticita.",
    panelBody:
      "A Natale vogliamo parlarti con un tono piu accogliente, mantenendo la stessa identita con cui ti accompagniamo tutto l'anno.",
    panelStats: [
      { value: "25", label: "dicembre" },
      { value: "Natale", label: "ricorrenza" },
      { value: "Calore", label: "mood" },
    ],
    panelNote: "Il nostro augurio passa da qui: una presenza semplice, umana e riconoscibile anche nel giorno di festa.",
    heroNumber: "25",
    theme: redTheme,
  },
  {
    key: "saint-stephen",
    priority: 120,
    type: "single_day",
    month: 12,
    day: 26,
    badge: "26 dicembre | Santo Stefano",
    label: "Santo Stefano",
    title: "Continua il clima delle feste, con un tono piu raccolto.",
    description:
      "Il 26 dicembre mantiene una presenza dedicata, piu morbida e discreta, per accompagnarti anche in questa giornata con continuita.",
    chips: ["Santo Stefano", "Continuita", "Tono raccolto"],
    primaryCtaLabel: "Vai ai servizi",
    primaryCtaHref: "/servizi",
    secondaryCtaLabel: "Contattaci",
    secondaryCtaHref: "/contatti",
    panelEyebrow: "26 Dicembre",
    panelTitle: "Una giornata che prolunga il senso delle feste con misura.",
    panelBody:
      "Dopo Natale manteniamo un tono ancora festivo, ma piu quieto, per continuare a parlarti con vicinanza e coerenza anche il 26 dicembre.",
    panelStats: [
      { value: "26", label: "dicembre" },
      { value: "Festivita", label: "continua" },
      { value: "Misura", label: "tono" },
    ],
    panelNote: "Anche qui il messaggio resta diretto: continuare a esserci, con la stessa identita, anche in una giornata piu raccolta.",
    heroNumber: "26",
    theme: redTheme,
  },
];

export function getSeasonalHeroByKey(key: string) {
  return seasonalHeroConfigs.find((item) => item.key === key) || null;
}

function resolveDynamicSeasonalHero(config: SeasonalHeroConfig, year: number): ResolvedSeasonalHeroConfig {
  if (config.key !== "new-year") {
    return {
      ...config,
      badge: config.badge,
      description: config.description,
      panelBody: config.panelBody,
      panelStats: config.panelStats,
    };
  }

  return {
    ...config,
    badge: `1 gennaio ${year} | Nuovo anno`,
    description:
      `Iniziamo il ${year} con lo stesso approccio che ci guida ogni giorno: presenza reale, servizi utili e attenzione concreta alle persone.`,
    panelBody:
      `Ogni nuovo anno e un'occasione per ripartire con ordine, supporto e strumenti giusti per la quotidianita di privati e imprese nel ${year}.`,
    panelStats: [
      { value: "1", label: "gennaio" },
      { value: String(year), label: "anno corrente" },
      { value: "Sempre", label: "presenza" },
    ],
  };
}

export function getActiveSeasonalHero(date = new Date()) {
  const { year, month, day } = getRomeDateParts(date);

  const matches = seasonalHeroConfigs.filter((config) => {
    if (config.type === "single_day") {
      return config.month === month && config.day === day;
    }

    if (config.type === "date_range") {
      if (config.year && config.year !== year) return false;
      if (
        month < (config.startMonth ?? 0) ||
        month > (config.endMonth ?? 13)
      ) {
        return false;
      }
      if (month === config.startMonth && day < (config.startDay ?? 1)) return false;
      if (month === config.endMonth && day > (config.endDay ?? 31)) return false;
      return true;
    }

    if (config.type === "movable" && config.key === "easter") {
      const easter = getEasterDate(year);
      return easter.month === month && easter.day === day;
    }

    return false;
  });

  matches.sort((a, b) => b.priority - a.priority);
  return matches[0] ? resolveDynamicSeasonalHero(matches[0], year) : null;
}

export function getResolvedSeasonalHeroByKey(key: string, date = new Date()) {
  const config = getSeasonalHeroByKey(key);
  if (!config) return null;
  const { year } = getRomeDateParts(date);
  return resolveDynamicSeasonalHero(config, year);
}
