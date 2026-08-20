import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeColors } from '../theme';
import { CalendarEvent } from '../types';

interface WeeklyFlowBarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  theme: ThemeColors;
  events: CalendarEvent[];
}

export const WeeklyFlowBar: React.FC<WeeklyFlowBarProps> = ({
  selectedDate,
  onSelectDate,
  theme,
  events,
}) => {
  // Get Monday of the current selected date's week
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMonday(selectedDate);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayNamesTr = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  const getEventsCountForDay = (d: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.startTime);
      return isSameDay(eventDate, d);
    }).length;
  };

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    onSelectDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    onSelectDate(next);
  };

  const handleJumpToday = () => {
    onSelectDate(new Date());
  };

  return (
    <div className="w-full px-4 sm:px-6 py-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSubtle }}>
            Haftalık Akış Çizelgesi
          </span>
          {!isToday(selectedDate) && (
            <button
              id="jump-today-btn"
              onClick={handleJumpToday}
              className="text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors"
              style={{
                backgroundColor: `${theme.accent}20`,
                color: theme.accent,
                border: `1px solid ${theme.accent}40`,
              }}
            >
              Bugüne Dön
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            id="prev-week-btn"
            onClick={handlePrevWeek}
            aria-label="Önceki Hafta"
            className="p-1 rounded-lg transition-colors hover:opacity-80"
            style={{ color: theme.textMuted, backgroundColor: theme.panel }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            id="next-week-btn"
            onClick={handleNextWeek}
            aria-label="Sonraki Hafta"
            className="p-1 rounded-lg transition-colors hover:opacity-80"
            style={{ color: theme.textMuted, backgroundColor: theme.panel }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const count = getEventsCountForDay(day);
          const todayMarker = isToday(day);

          return (
            <button
              key={idx}
              id={`weekly-day-${day.getDate()}-${day.getMonth()}`}
              onClick={() => onSelectDate(day)}
              className="relative flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-2xl transition-all duration-200 cursor-pointer text-center group"
              style={{
                backgroundColor: isSelected ? theme.accent : theme.panel,
                border: `1px solid ${isSelected ? theme.accent : todayMarker ? `${theme.accent}60` : theme.border}`,
                boxShadow: isSelected ? `0 4px 16px ${theme.accent}35` : 'none',
              }}
            >
              {todayMarker && !isSelected && (
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                  title="Bugün"
                />
              )}

              <span
                className="text-[11px] sm:text-xs font-bold transition-colors"
                style={{
                  color: isSelected ? theme.bg : theme.textMuted,
                }}
              >
                {dayNamesTr[idx]}
              </span>

              <span
                className="text-base sm:text-lg font-black mt-0.5 tracking-tight transition-colors"
                style={{
                  color: isSelected ? theme.bg : theme.textPrimary,
                }}
              >
                {day.getDate()}
              </span>

              {/* Event count dots */}
              <div className="flex items-center gap-0.5 mt-1 h-1.5">
                {count > 0 &&
                  Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: isSelected ? theme.bg : theme.accent,
                      }}
                    />
                  ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
