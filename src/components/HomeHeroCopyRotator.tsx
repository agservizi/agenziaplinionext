"use client";

import { useEffect, useMemo, useState } from "react";

type HeroCopy = {
  title: string;
  description: string;
};

const HERO_COPIES: HeroCopy[] = [
  {
    title: "Consulenze affidabili per telefonia, energia e servizi digitali.",
    description:
      "AG SERVIZI supporta privati e aziende con soluzioni personalizzate, rapide e trasparenti, combinando competenza locale e innovazione digitale.",
  },
  {
    title: "Un unico punto di riferimento per semplificare le tue pratiche quotidiane.",
    description:
      "Ti aiutiamo a scegliere soluzioni chiare e concrete su telefonia, energia e servizi digitali, con assistenza umana e tempi rapidi.",
  },
  {
    title: "Servizi essenziali gestiti con metodo, velocita e supporto reale.",
    description:
      "Dalla consulenza iniziale all'operativita, AG SERVIZI affianca famiglie e imprese con un approccio pratico e orientato al risultato.",
  },
  {
    title: "Tecnologia e presenza locale per decisioni piu semplici e sicure.",
    description:
      "Confrontiamo opzioni, riduciamo complessita e ti guidiamo passo dopo passo con una consulenza trasparente su misura.",
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

