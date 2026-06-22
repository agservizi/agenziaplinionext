"use client";

import { useEffect, useMemo, useState } from "react";

type HeroCopy = {
  title: string;
  description: string;
};

const HERO_COPIES: HeroCopy[] = [
  {
    title: "Telefonia, energia, SPID e spedizioni. Tutto in Via Plinio 72.",
    description:
      "Vieni in agenzia, spiegaci cosa ti serve e ci pensiamo noi. Niente call center, niente attese. Dal 2016 a Castellammare di Stabia.",
  },
  {
    title: "Hai una bolletta da pagare, un contratto da cambiare o uno SPID da fare?",
    description:
      "Passa da noi. Ti seguiamo dall'inizio alla fine, di persona. Consulenza gratuita, sempre.",
  },
  {
    title: "Stessa agenzia, stesse facce. Da dieci anni.",
    description:
      "Non siamo una catena e non abbiamo un menu vocale. Ci trovi in Via Plinio 72, dal lunedi al sabato.",
  },
  {
    title: "Spedizioni, visure, PEC, firma digitale. E anche siti web.",
    description:
      "Se non sai da dove iniziare, vieni a parlarne. Ti diciamo cosa conviene e quanto costa, prima di fare qualsiasi cosa.",
  },
];

export default function HomeHeroCopyRotator() {
  const [index, setIndex] = useState(0);
  const copy = useMemo(() => HERO_COPIES[index] ?? HERO_COPIES[0], [index]);

  useEffect(() => {
    if (HERO_COPIES.length <= 1) return;
    const next = Math.floor(Math.random() * HERO_COPIES.length);
    setIndex(next);
  }, []);

  return (
    <>
      <h1 className="text-4xl font-semibold text-white md:text-6xl">{copy.title}</h1>
      <p className="max-w-2xl text-base text-slate-300 md:text-xl">{copy.description}</p>
    </>
  );
}

