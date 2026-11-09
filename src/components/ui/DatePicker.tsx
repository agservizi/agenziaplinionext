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
        <label htmlFor={id} className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/45">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        onClick={() => {
          if (!open && selected) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
          }
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-11 w-full items-center gap-3 border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-3.5 text-left text-sm text-[var(--ink)] outline-none transition hover:border-[var(--ink)]/25 focus:border-[#5E0ED7]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--ink)]/45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={displayValue ? "text-[var(--ink)]" : "text-[var(--ink)]/40"}>
          {displayValue || placeholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Seleziona una data"
          className="absolute bottom-full left-0 z-50 mb-2 w-[280px] border border-[var(--ink)]/15 bg-[var(--paper)] p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              aria-label="Mese precedente"
              className="flex h-8 w-8 items-center justify-center text-[var(--ink)]/50 transition hover:bg-[var(--ink)]/5 hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 15l-5-5 5-5" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-[var(--ink)]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Mese successivo"
              className="flex h-8 w-8 items-center justify-center text-[var(--ink)]/50 transition hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 5l5 5-5 5" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]/35">
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
                  className={`flex h-9 w-full items-center justify-center text-sm transition ${
                    isSelected
                      ? "bg-[var(--ink)] font-bold text-white"
                      : isToday
                        ? "font-semibold text-[#5E0ED7] hover:bg-[var(--ink)]/5"
                        : isDisabled
                          ? "cursor-not-allowed text-[var(--ink)]/20"
                          : "text-[var(--ink)]/70 hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]"
                  }`}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[var(--ink)]/10 pt-3">
            <button
              type="button"
              onClick={() => { onChange(toDateStr(today)); setOpen(false); }}
              disabled={today < min}
              className="text-xs font-medium text-[#5E0ED7] transition hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Oggi
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs font-medium text-[var(--ink)]/45 transition hover:text-[var(--ink)]"
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
