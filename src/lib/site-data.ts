export const company = {
  name: "AG SERVIZI",
  legalName: "AG SERVIZI VIA PLINIO 72 DI CAVALIERE CARMINE",
  address: "Via Plinio il Vecchio 72, 80053 Castellammare di Stabia (NA)",
  vat: "08442881218",
  sdi: "KRRH6B9",
  openedYear: 2016,
  openedMonth: 6,
  openedDay: 1,
  phone: "+39 377 379 8570",
  whatsapp: "393773798570",
  googleBusinessUrl:
    "https://maps.app.goo.gl/FDVRXDWNp7J5dRrk8",
};

export function getYearsActive(): number {
  const now = new Date();
  const opened = new Date(company.openedYear, company.openedMonth - 1, company.openedDay);
  let years = now.getFullYear() - opened.getFullYear();
  const anniversaryPassed =
    now.getMonth() > opened.getMonth() ||
    (now.getMonth() === opened.getMonth() && now.getDate() >= opened.getDate());
  if (!anniversaryPassed) years--;
  return years;
}

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Chi Siamo", href: "/chi-siamo" },
  { label: "Servizi", href: "/servizi" },
  { label: "Area Clienti", href: "/area-clienti" },
  { label: "Web Agency", href: "/web-agency" },
  { label: "Contatti", href: "/contatti" },
];

export const values = [
  {
    title: "Affidabilità",
    description:
      "Ti diciamo come stanno le cose, quanto costa e quanto ci vuole. Niente sorprese dopo la firma.",
  },
  {
    title: "Velocità",
    description:
      "SPID in 20 minuti, bollettini in 5. Se puoi farlo oggi, lo facciamo oggi.",
  },
  {
    title: "Consulenza su misura",
    description:
      "Guardiamo le tue bollette, i tuoi consumi, la tua situazione. Poi ti consigliamo quello che conviene a te.",
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
    subtitle: "Bollettini, F24, PagoPA e bollo auto. Porti il foglio, pensiamo a tutto.",
    icon: "payments",
    items: [
      { title: "Bollettini (123 – 451 – 674 – 896)", description: "Li compili e paghi direttamente da noi." },
      { title: "Bonifici bancari", description: "Ti aiutiamo con IBAN, causale e conferma." },
      { title: "F24", description: "Controllo dati e pagamento in pochi minuti." },
      { title: "PagoPA", description: "Multe, tasse, ticket: paghi qui." },
      { title: "Tassa di possesso", description: "Bollo auto con verifica dei dati." },
      { title: "Versamento passaporto", description: "Bollettino per rilascio o rinnovo passaporto." },
    ],
  },
  {
    id: "telefonia",
    title: "Telefonia",
    subtitle: "Ti aiutiamo a scegliere l'offerta giusta e gestiamo tutta la pratica.",
    icon: "phone",
    items: [
      { title: "Iliad Space", description: "Mobile e fibra, ti spieghiamo le differenze." },
      { title: "WindTre", description: "Casa, mobile e business." },
      { title: "Fastweb", description: "Fibra e mobile, verifica copertura inclusa." },
      { title: "Very Mobile", description: "Poche complicazioni, prezzo fisso." },
      { title: "Ho. Mobile", description: "Attivazione e portabilita in sede." },
      { title: "Digi Mobile", description: "Piani e attivazioni con assistenza." },
    ],
  },
  {
    id: "energia",
    title: "Energia",
    subtitle: "Guardiamo la tua bolletta e ti diciamo se puoi spendere meno.",
    icon: "energy",
    items: [
      { title: "Enel Energia", description: "Luce e gas, ti seguiamo nel cambio." },
      { title: "A2A Energia", description: "Confrontiamo i costi con la tua bolletta." },
      { title: "WindTre Luce e Gas", description: "Se hai gia WindTre, vediamo il pacchetto." },
      { title: "Fastweb Energia", description: "Luce e gas con gestione da app." },
    ],
  },
  {
    id: "logistica",
    title: "Servizi Logistici",
    subtitle: "Prepariamo la spedizione, stampiamo l'etichetta e organizziamo il ritiro.",
    icon: "logistics",
    items: [
      { title: "Spedizioni nazionali", description: "Italia, con ritiro a domicilio o in sede." },
      { title: "Spedizioni internazionali", description: "Estero, con documentazione e tracking." },
    ],
  },
  {
    id: "digitali",
    title: "Servizi Digitali",
    subtitle: "SPID, PEC, firma digitale. Vieni con un documento e esci con tutto attivo.",
    icon: "digital",
    items: [
      { title: "SPID", description: "Pronto in 20 minuti, in sede." },
      { title: "PEC", description: "Apriamo e configuriamo la casella." },
      { title: "Firma Digitale", description: "Attivazione e primi utilizzi con noi." },
      { title: "Partner ufficiale Namirial", description: "Punto autorizzato per i servizi Namirial." },
      { title: "Posta Telematica", description: "Ti aiutiamo con invio e gestione." },
      { title: "Invio PEC", description: "Controlliamo allegati e destinatario prima di inviare." },
      { title: "Invio Email", description: "Singole o in blocco, con controllo prima dell'invio." },
    ],
  },
  {
    id: "web-agency",
    title: "Web Agency",
    subtitle: "Siti web, e-commerce e gestionali. Ti diciamo i costi prima di iniziare.",
    icon: "web",
    items: [
      { title: "Realizzazione siti web", description: "Pensati per farti trovare e contattare." },
      { title: "Gestionali su misura", description: "Costruiti sul tuo modo di lavorare." },
    ],
  },
];
