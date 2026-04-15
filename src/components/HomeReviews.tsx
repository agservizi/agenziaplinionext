"use client";

import { useRef, useState } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/SectionHeading";

const reviews = [
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
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 ${filled ? "text-amber-400" : "text-slate-200"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-label="Google" role="img">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const CARD_WIDTH = 296; // px — larghezza card + gap

export default function HomeReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, velX: 0, lastX: 0, lastT: 0 });
  const rafRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? CARD_WIDTH * 2 : -CARD_WIDTH * 2,
      behavior: "smooth",
    });
  }

  function onMouseDown(e: React.MouseEvent) {
    const el = scrollRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.scrollSnapType = "none";
    dragRef.current = {
      active: true,
      startX: e.pageX,
      scrollLeft: el.scrollLeft,
      velX: 0,
      lastX: e.pageX,
      lastT: performance.now(),
    };
    setIsDragging(false);
  }

  function onMouseMove(e: React.MouseEvent) {
    const d = dragRef.current;
    const el = scrollRef.current;
    if (!d.active || !el) return;
    const now = performance.now();
    const dt = now - d.lastT || 1;
    d.velX = (e.pageX - d.lastX) / dt;
    d.lastX = e.pageX;
    d.lastT = now;
    const delta = e.pageX - d.startX;
    if (Math.abs(delta) > 4) setIsDragging(true);
    el.scrollLeft = d.scrollLeft - delta;
  }

  function onMouseUp() {
    const d = dragRef.current;
    const el = scrollRef.current;
    if (!d.active || !el) return;
    d.active = false;
    setTimeout(() => setIsDragging(false), 0);
    let vel = -d.velX * 16;
    if (Math.abs(vel) < 0.5) {
      el.style.scrollSnapType = "x mandatory";
      return;
    }
    function momentum() {
      if (!el) return;
      el.scrollLeft += vel;
      vel *= 0.93;
      if (Math.abs(vel) > 0.5) {
        rafRef.current = requestAnimationFrame(momentum);
      } else {
        el.style.scrollSnapType = "x mandatory";
      }
    }
    rafRef.current = requestAnimationFrame(momentum);
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-300/6 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-cyan-400/6 blur-3xl" />
      </div>

      <Container className="relative z-10 space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Recensioni clienti"
            title="Cosa dicono di noi"
            description="Tutte le recensioni Google verificate dei nostri clienti a Castellammare di Stabia."
            tone="dark"
            align="center"
          />
        </Reveal>

        {/* Rating summary */}
        <Reveal delay={0.05}>
          <div className="mx-auto flex max-w-xs flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled={true} />
              ))}
            </div>
            <p className="text-2xl font-bold text-slate-900">5.0</p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <GoogleLogo />
              su Google · {reviews.length} recensioni verificate
            </p>
          </div>
        </Reveal>

        {/* Carousel */}
        <Reveal delay={0.08}>
          <div className="relative">
            {/* Scroll container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto px-1 pb-4 pt-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", cursor: isDragging ? "grabbing" : "grab", userSelect: "none" } as React.CSSProperties}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md"
                  style={{ scrollSnapAlign: "start" }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${review.color} text-xs font-bold text-white`}>
                      {review.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{review.name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <GoogleLogo />
                        Google
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} filled={i <= review.rating} />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="flex-1 text-sm leading-relaxed text-slate-500">
                    {review.text ? `"${review.text}"` : (
                      <span className="italic text-slate-400">Recensione con 5 stelle.</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Frecce navigazione */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => scroll("left")}
                aria-label="Recensioni precedenti"
                className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Recensioni successive"
                className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.1}>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-slate-500">
              La tua esperienza con AG SERVIZI è stata positiva?
            </p>
            <a
              href="https://www.google.com/maps/place/AG+SERVIZI+VIA+PLINIO+72+DI+CAVALIERE+CARMINE/@40.7004667,14.4853708,17z/data=!3m1!5s0x133bbd4640846007:0x127e51d71a00ab80!4m6!3m5!1s0x133bbd463f76daab:0xcb56bc8d70daedc5!8m2!3d40.7004667!4d14.4853708!16s%2Fg%2F11cn8yvt32?entry=ttu&g_ep=EgoyMDI2MDQxMi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-800 hover:shadow-lg"
            >
              <GoogleLogo />
              Lascia una recensione su Google
              <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" aria-hidden="true">
                <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
