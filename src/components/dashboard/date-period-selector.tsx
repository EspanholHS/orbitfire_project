"use client";

import { CalendarDays, Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AvailableDailyPeriod } from "@/types/orbitfire-api";

export function DatePeriodSelector({
  loadingDate,
  onDateChange,
  periods,
  selectedDate,
}: {
  loadingDate: string | null;
  onDateChange: (date: string) => void;
  periods: AvailableDailyPeriod[];
  selectedDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selected = periods.find((period) => period.date === selectedDate);
  const activeLabel = selected?.label ?? formatDateLabel(selectedDate);

  useEffect(() => {
    if (!open) return;

    const updateRect = () => {
      if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
    };
    const closeOnOutside = (event: MouseEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("mousedown", closeOnOutside);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("mousedown", closeOnOutside);
    };
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        className={`orbitfire-date-selector group inline-flex h-11 min-w-[138px] items-center gap-2 rounded-lg border px-3 text-left transition ${
          open
            ? "border-orange-300/35 bg-orange-500/12 text-white shadow-[0_0_26px_rgba(249,115,22,0.14)]"
            : "border-white/10 bg-white/[0.035] text-white/68 hover:border-orange-300/25 hover:bg-orange-500/10 hover:text-white"
        }`}
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <CalendarDays className="text-orange-300/80" size={16} />
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/36">
            Data analisada
          </span>
          <span className="mt-1 text-xs font-medium">{activeLabel}</span>
        </span>
        {loadingDate ? (
          <Loader2 className="ml-auto animate-spin text-orange-300" size={14} />
        ) : (
          <ChevronDown
            className={`ml-auto text-white/44 transition-transform ${open ? "rotate-180" : ""}`}
            size={15}
          />
        )}
      </button>

      {open && rect
        ? createPortal(
            <div
              className="fixed z-[9999] rounded-xl border border-orange-300/18 bg-[#0b0908]/98 p-2 shadow-[0_22px_80px_rgba(0,0,0,0.62),0_0_36px_rgba(249,115,22,0.14)] backdrop-blur-2xl"
              ref={menuRef}
              style={{
                left: Math.min(rect.left, window.innerWidth - 260),
                minWidth: Math.max(rect.width, 230),
                top: rect.bottom + 8,
              }}
            >
              <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-orange-200/70">
                Dias disponiveis
              </p>
              <div className="orbitfire-scrollbar max-h-[280px] overflow-y-auto pr-1">
                {periods.map((period) => {
                  const selectedPeriod = period.date === selectedDate;
                  return (
                    <button
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        selectedPeriod
                          ? "bg-orange-500/16 text-orange-200 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.16)]"
                          : "text-white/64 hover:bg-white/[0.055] hover:text-white"
                      }`}
                      key={period.date}
                      onClick={() => {
                        setOpen(false);
                        if (!selectedPeriod) onDateChange(period.date);
                      }}
                      type="button"
                    >
                      <span className="flex-1">{period.label}</span>
                      {selectedPeriod ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-orange-200">
                          <Check size={13} />
                          Selecionado
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
