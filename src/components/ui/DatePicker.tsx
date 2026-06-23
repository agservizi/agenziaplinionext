"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const WEEKDAYS = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type DatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  label?: string;
  id?: string;
  placeholder?: string;
};

export default function DatePicker({ value, onChange, minDate, label, id, placeholder = "Seleziona data" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? parseDate(minDate) : today;

  const selected = value ? parseDate(value) : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }, [viewMonth]);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const canGoPrev = new Date(viewYear, viewMonth, 1) > min;

  const displayValue = selected
    ? `${selected.getDate()} ${MONTHS[selected.getMonth()].slice(0, 3).toLowerCase()} ${selected.getFullYear()}`
    : "";

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label htmlFor={id} className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-left text-sm text-white outline-none transition hover:border-white/25 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={displayValue ? "text-white" : "text-white/40"}>
          {displayValue || placeholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Seleziona una data"
          className="absolute left-0 bottom-full z-50 mb-2 w-[280px] rounded-xl border border-white/15 bg-[#0f1d32]/98 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              aria-label="Mese precedente"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 15l-5-5 5-5" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Mese successivo"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 5l5 5-5 5" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;
              const dateStr = toDateStr(cell);
              const isDisabled = cell < min;
              const isSelected = selected ? isSameDay(cell, selected) : false;
              const isToday = isSameDay(cell, today);

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => { onChange(dateStr); setOpen(false); }}
                  className={`flex h-9 w-full items-center justify-center rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-cyan-500 font-bold text-slate-950"
                      : isToday
                        ? "font-semibold text-cyan-400 hover:bg-white/10"
                        : isDisabled
                          ? "cursor-not-allowed text-white/15"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => { onChange(toDateStr(today)); setOpen(false); }}
              disabled={today < min}
              className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Oggi
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs font-medium text-white/40 transition hover:text-white/60"
              >
                Cancella
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
