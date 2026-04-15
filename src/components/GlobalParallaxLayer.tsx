"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Livello parallax globale — fixed, pointer-events-none, z-[1].
 * Tre gradienti morbidi si muovono a velocità diverse al scroll,
 * creando un effetto di profondità su tutte le pagine pubbliche
 * senza toccare nessuna pagina individuale.
 *
 * Disabilitato automaticamente se l'utente ha attivato
 * "Riduci movimento" nel sistema operativo.
 */
export default function GlobalParallaxLayer() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Layer 1 — scende lentamente (parallax positivo)
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  // Layer 2 — sale (parallax inverso)
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  // Layer 3 — scende a velocità intermedia
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);

  if (shouldReduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {/* Cyan — in alto a sinistra, scende */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-1/2 left-0 h-[90vh] w-[90vh] rounded-full bg-cyan-500/6 blur-[100px] md:blur-[150px]"
      />
      {/* Violet — centro destra, sale */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/3 -right-1/4 h-[80vh] w-[80vh] rounded-full bg-violet-500/5 blur-[100px] md:blur-[140px]"
      />
    </div>
  );
}
