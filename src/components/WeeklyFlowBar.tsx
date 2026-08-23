import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ThemeColors } from '../theme';
import { CalendarEvent } from '../types';

interface WeeklyFlowBarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  theme: ThemeColors;
  events: CalendarEvent[];
}

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const YEARS = Array.from({ length: 201 }, (_, index) => 1900 + index);
const sameDay = (left: Date, right: Date) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function MonthPicker({ selectedDate, onSelectDate, theme, onClose }: WeeklyFlowBarProps & { onClose: () => void }) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const swipeStart = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const changeMonth = (amount: number) => {
    setViewDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + amount, 1);
      return next.getFullYear() < 1900 || next.getFullYear() > 2100 ? current : next;
    });
  };

  const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const dayCount = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: offset + dayCount }, (_, index) => index < offset ? null : new Date(viewDate.getFullYear(), viewDate.getMonth(), index - offset + 1));

  return <div className="app-modal-layer fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
    <section className="app-modal-panel w-full max-w-md rounded-3xl border p-4 sm:p-5 shadow-2xl" style={{ backgroundColor: theme.panel, borderColor: theme.border }} onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex min-w-0 items-center gap-2">
          <select aria-label="Ay seç" value={viewDate.getMonth()} onChange={(event) => setViewDate(new Date(viewDate.getFullYear(), Number(event.target.value), 1))} className="min-w-0 rounded-xl border px-3 py-2 text-sm font-bold outline-none" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}>
            {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
          </select>
          <select aria-label="Yıl seç" value={viewDate.getFullYear()} onChange={(event) => setViewDate(new Date(Number(event.target.value), viewDate.getMonth(), 1))} className="rounded-xl border px-3 py-2 text-sm font-bold outline-none" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}>
            {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <button onClick={onClose} aria-label="Takvimi kapat" className="p-2 rounded-xl" style={{ backgroundColor: theme.card, color: theme.textMuted }}><X size={17}/></button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={() => changeMonth(-1)} disabled={viewDate.getFullYear() === 1900 && viewDate.getMonth() === 0} className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: theme.card, color: theme.textMuted }} aria-label="Önceki ay"><ChevronLeft size={18}/></button>
        <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
        <button onClick={() => changeMonth(1)} disabled={viewDate.getFullYear() === 2100 && viewDate.getMonth() === 11} className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: theme.card, color: theme.textMuted }} aria-label="Sonraki ay"><ChevronRight size={18}/></button>
      </div>

      <div onPointerDown={(event) => { swipeStart.current = event.clientX; didSwipe.current = false; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={(event) => { if (swipeStart.current !== null) { const distance = event.clientX - swipeStart.current; if (Math.abs(distance) > 55) { didSwipe.current = true; changeMonth(distance < 0 ? 1 : -1); } } swipeStart.current = null; }} onPointerCancel={() => { swipeStart.current = null; }} style={{ touchAction: 'pan-y' }}>
        <div className="grid grid-cols-7 gap-1 mb-1">{['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => <span key={day} className="py-1 text-center text-[10px] font-bold" style={{ color: theme.textSubtle }}>{day}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => date ? <button key={dateKey(date)} onClick={() => { if (didSwipe.current) { didSwipe.current = false; return; } onSelectDate(date); onClose(); }} className="relative aspect-square rounded-xl text-xs font-bold" style={{ backgroundColor: sameDay(date, selectedDate) ? theme.accent : theme.card, color: sameDay(date, selectedDate) ? theme.bg : sameDay(date, new Date()) ? theme.accent : theme.textPrimary, border: `1px solid ${sameDay(date, new Date()) ? `${theme.accent}70` : theme.border}` }}>{date.getDate()}</button> : <span key={`empty-${index}`}/>) }
        </div>
      </div>

      <button onClick={() => { onSelectDate(new Date()); onClose(); }} className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent, border: `1px solid ${theme.accent}40` }}>Bugüne Git</button>
      <p className="mt-2 text-center text-[10px]" style={{ color: theme.textSubtle }}>Aylar arasında sağa veya sola kaydırabilirsiniz.</p>
    </section>
  </div>;
}

export const WeeklyFlowBar: React.FC<WeeklyFlowBarProps> = ({ selectedDate, onSelectDate, theme, events }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const days = useMemo(() => Array.from({ length: 731 }, (_, index) => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() + index - 365);
    date.setHours(0, 0, 0, 0);
    return date;
  }), [selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()]);

  const eventCounts = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((event) => { const key = dateKey(new Date(event.startTime)); counts.set(key, (counts.get(key) || 0) + 1); });
    return counts;
  }, [events]);

  useEffect(() => {
    requestAnimationFrame(() => selectedRef.current?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' }));
  }, [days]);

  const shiftWeek = (amount: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + amount * 7);
    onSelectDate(next);
  };

  return <>
    <div className="w-full px-4 sm:px-6 py-2">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[11px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSubtle }}>Haftalık Akış Çizelgesi</span>
          <button id="open-calendar-btn" onClick={() => setCalendarOpen(true)} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-bold" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent, border: `1px solid ${theme.accent}40` }}><CalendarDays size={13}/>Takvimi Aç</button>
          {!sameDay(selectedDate, new Date()) && <button onClick={() => onSelectDate(new Date())} className="hidden sm:block shrink-0 text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: theme.panel, color: theme.textMuted }}>Bugüne Dön</button>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shiftWeek(-1)} aria-label="Önceki hafta" className="p-1 rounded-lg" style={{ color: theme.textMuted, backgroundColor: theme.panel }}><ChevronLeft size={16}/></button>
          <button onClick={() => shiftWeek(1)} aria-label="Sonraki hafta" className="p-1 rounded-lg" style={{ color: theme.textMuted, backgroundColor: theme.panel }}><ChevronRight size={16}/></button>
        </div>
      </div>

      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1" style={{ overscrollBehaviorX: 'contain', touchAction: 'pan-x' }}>
        {days.map((day) => {
          const selected = sameDay(day, selectedDate);
          const today = sameDay(day, new Date());
          const count = eventCounts.get(dateKey(day)) || 0;
          return <button ref={selected ? selectedRef : undefined} key={dateKey(day)} onClick={() => onSelectDate(day)} className="relative snap-center shrink-0 w-[calc((100%-3rem)/7)] min-w-[42px] sm:min-w-[56px] flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-2xl" style={{ backgroundColor: selected ? theme.accent : theme.panel, border: `1px solid ${selected ? theme.accent : today ? `${theme.accent}70` : theme.border}`, boxShadow: selected ? `0 4px 16px ${theme.accent}35` : 'none' }}>
            {today && !selected && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }}/>}
            <span className="text-[11px] sm:text-xs font-bold" style={{ color: selected ? theme.bg : theme.textMuted }}>{day.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 3)}</span>
            <span className="text-base sm:text-lg font-black mt-0.5" style={{ color: selected ? theme.bg : theme.textPrimary }}>{day.getDate()}</span>
            <div className="flex gap-0.5 mt-1 h-1.5">{Array.from({ length: Math.min(count, 3) }).map((_, index) => <span key={index} className="w-1 h-1 rounded-full" style={{ backgroundColor: selected ? theme.bg : theme.accent }}/>)}</div>
          </button>;
        })}
      </div>
    </div>
    {calendarOpen && <MonthPicker selectedDate={selectedDate} onSelectDate={onSelectDate} theme={theme} events={events} onClose={() => setCalendarOpen(false)}/>}
  </>;
};
