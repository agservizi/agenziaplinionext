export const company = {
  name: "AG SERVIZI",
  legalName: "AG SERVIZI VIA PLINIO 72 DI CAVALIERE CARMINE",
  address: "Via Plinio il Vecchio 72, 80053 Castellammare di Stabia (NA)",
  vat: "08442881218",
  sdi: "KRRH6B9",
  openedYear: 2016,
  googleBusinessUrl:
    "https://www.google.com/maps/search/?api=1&query=Via%20Plinio%20il%20Vecchio%2072%2C%2080053%20Castellammare%20di%20Stabia",
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Chi Siamo", href: "/chi-siamo" },
  { label: "Servizi", href: "/servizi" },
  { label: "Store", href: "/store" },
  { label: "Web Agency", href: "/web-agency" },
  { label: "Contatti", href: "/contatti" },
];

export const values = [
  {
    title: "Affidabilità",
    description:
      "Processi chiari, trasparenti e costruiti per proteggere i tuoi interessi.",
  },
  {
    title: "Velocità",
    description:
      "Tempi rapidi di risposta e soluzioni operative senza burocrazia inutile.",
  },
  {
    title: "Consulenza su misura",
    description:
      "Analizziamo esigenze e consumi per proporre la soluzione più adatta.",
  },
];

export type ServiceItem = {
  title: string;
  description: string;
};

export type ServiceCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: "payments" | "phone" | "energy" | "logistics" | "digital" | "web";
  items: ServiceItem[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: "pagamenti",
    title: "Pagamenti",
    subtitle: "Gestione completa dei principali strumenti di pagamento.",
    icon: "payments",
    items: [
      { title: "Bollettini (123 – 451 – 674 – 896)", description: "Incassi rapidi e sicuri." },
      { title: "Bonifici bancari", description: "Operazioni assistite e tracciate." },
      { title: "F24", description: "Compilazione guidata e invio." },
      { title: "PagoPA", description: "Pagamenti digitali per la PA." },
      { title: "Tassa di possesso", description: "Supporto al pagamento regionale." },
    ],
  },
  {
    id: "telefonia",
    title: "Telefonia",
    subtitle: "Consulenza e attivazioni con i migliori operatori.",
    icon: "phone",
    items: [
      { title: "Iliad Space", description: "Piani smart e trasparenti." },
      { title: "WindTre", description: "Offerte convergenti e business." },
      { title: "Fastweb", description: "Soluzioni ultraveloci." },
      { title: "Very Mobile", description: "Tariffe semplici e convenienti." },
      { title: "Ho. Mobile", description: "Offerte affidabili e chiare." },
      { title: "Digi Mobile", description: "Connettività flessibile." },
    ],
  },
  {
    id: "energia",
    title: "Energia",
    subtitle: "Contratti luce e gas ottimizzati per privati e aziende.",
    icon: "energy",
    items: [
      { title: "Enel Energia", description: "Soluzioni consolidate." },
      { title: "A2A Energia", description: "Offerte sostenibili." },
      { title: "WindTre Luce e Gas", description: "Pacchetti integrati." },
      { title: "Fastweb Energia", description: "Gestione digitale." },
      { title: "Egea", description: "Servizi energetici locali." },
      { title: "Iren", description: "Supporto multicanale." },
    ],
  },
  {
    id: "logistica",
    title: "Servizi Logistici",
    subtitle: "Spedizioni assistite con tracciamento dedicato.",
    icon: "logistics",
    items: [
      { title: "Spedizioni nazionali", description: "Consegne rapide in Italia." },
      { title: "Spedizioni internazionali", description: "Gestione doganale e tracking." },
    ],
  },
  {
    id: "digitali",
    title: "Servizi Digitali",
    subtitle: "Identità e comunicazione digitale in un unico punto.",
    icon: "digital",
    items: [
      { title: "SPID", description: "Attivazioni e supporto." },
      { title: "PEC", description: "Caselle certificate professionali." },
      { title: "Firma Digitale", description: "Processi digitali sicuri." },
      { title: "Partner ufficiale Namirial", description: "Servizi certificati." },
      { title: "Posta Telematica", description: "Assistenza dedicata." },
      { title: "Invio PEC", description: "Comunicazioni legali rapide." },
      { title: "Invio Email", description: "Gestione invii massivi e singoli." },
    ],
  },
  {
    id: "web-agency",
    title: "Web Agency",
    subtitle: "Progetti digitali su misura per crescere online.",
    icon: "web",
    items: [
      { title: "Realizzazione siti web", description: "Design moderno e performante." },
      { title: "Gestionali su misura", description: "Soluzioni interne scalabili." },
    ],
  },
];
