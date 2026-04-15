const items = [
  "500+ Clienti attivi",
  "Dal 2016",
  "5★ su Google",
  "Castellammare di Stabia",
  "Consulenza gratuita",
  "Risposta entro 24h",
  "Telefonia e Energia",
  "SPID e PEC",
  "Spedizioni BRT",
  "Web Agency",
  "CAF e Patronato",
  "Pagamenti e Bollettini",
];

export default function MarqueeStrip() {
  const doubled = [...items, ...items];

  return (
    <div className="h-13 overflow-hidden border-y border-white/6 bg-slate-900/80 backdrop-blur-sm flex items-center">
      <div className="marquee-track flex gap-0 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-4 px-6 text-sm font-medium text-slate-400">
            <span className="h-1 w-1 rounded-full bg-cyan-400/70" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
