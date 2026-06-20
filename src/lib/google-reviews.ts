export type GoogleReview = {
  name: string;
  initials: string;
  color: string;
  rating: number;
  text: string | null;
};

export const googleReviews: GoogleReview[] = [
  {
    name: "Emanuele Longobardi",
    initials: "EL",
    color: "bg-cyan-500",
    rating: 5,
    text: "Personale gentile ed efficiente, spedizioni precise e veloci. Sicuramente una valida alternativa alle Poste Italiane in quanto gestione dei pacchi.",
  },
  {
    name: "Filippo Ferraro",
    initials: "FF",
    color: "bg-emerald-500",
    rating: 5,
    text: "I più bravi e affidabili.",
  },
  {
    name: "ferdinando di nocera",
    initials: "FN",
    color: "bg-rose-500",
    rating: 5,
    text: "Cinque stelle meritatissime!",
  },
  {
    name: "Juliet0291",
    initials: "JU",
    color: "bg-violet-500",
    rating: 5,
    text: "Efficienza, gentilezza e tanta disponibilità. TOP!",
  },
  {
    name: "Mariagrazia Molino",
    initials: "MM",
    color: "bg-amber-500",
    rating: 5,
    text: "Gentili e disponibili.",
  },
  {
    name: "Bryz _",
    initials: "BR",
    color: "bg-indigo-500",
    rating: 5,
    text: "Grazie alla loro professionalità e cortesia. Ti senti subito a casa.",
  },
  {
    name: "valerio schettino",
    initials: "VS",
    color: "bg-teal-500",
    rating: 5,
    text: "Ottima.",
  },
  {
    name: "Женя",
    initials: "ЖЕ",
    color: "bg-blue-500",
    rating: 5,
    text: "10/10",
  },
  {
    name: "Davide Venanzio",
    initials: "DV",
    color: "bg-orange-500",
    rating: 5,
    text: null,
  },
  {
    name: "Bernardino Galletti",
    initials: "BG",
    color: "bg-pink-500",
    rating: 5,
    text: null,
  },
  {
    name: "Princess Sofia",
    initials: "PS",
    color: "bg-orange-500",
    rating: 5,
    text: "I più gentili, affabili, simpatici, pazienti e competenti. Vi consiglio di spedire qualcosa, anche a voi stessi, solo per il piacere di conoscerli.",
  },
];

export const googleReviewsCount = googleReviews.length;
