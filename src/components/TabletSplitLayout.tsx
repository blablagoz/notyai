import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Volume2,
  Plus,
  Moon,
  Sun,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CalendarEvent, TeamModel } from '../types';
import { ThemeColors } from '../theme';
import { TimelineEventItem } from './TimelineEventItem';
import { FluidInteractionBar } from './FluidInteractionBar';
import { TimeFormatPreference } from '../utils/timeFormat';

interface TabletSplitLayoutProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  theme: ThemeColors;
  events: CalendarEvent[];
  teams: TeamModel[];
  dailyBriefing: string;
  isProcessingAI: boolean;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onSendCommand: (text: string) => Promise<void>;
  onOpenTeamWorkspace: () => void;
  onOpenAddEventModal: () => void;
  timeFormat?: TimeFormatPreference;
}

export const TabletSplitLayout: React.FC<TabletSplitLayoutProps> = ({
  selectedDate,
  onSelectDate,
  theme,
  events,
  teams,
  dailyBriefing,
  isProcessingAI,
  onToggleComplete,
  onDeleteEvent,
  onSendCommand,
  onOpenTeamWorkspace,
  onOpenAddEventModal,
  timeFormat = '24h',
}) => {
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), selectedDate));
  const completedCount = dayEvents.filter((e) => e.isCompleted).length;
  const pendingCount = dayEvents.length - completedCount;

  // Mini Calendar Calculations
  const currentMonthYearStr = selectedDate.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  const getDaysInMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday as 0: (firstDay === 0 ? 6 : firstDay - 1)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const monthDays = getDaysInMonth(selectedDate);

  const handlePrevMonth = () => {
    const prev = new Date(selectedDate);
    prev.setMonth(prev.getMonth() - 1);
    onSelectDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + 1);
    onSelectDate(next);
  };

  const speakBriefing = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingBriefing) {
        window.speechSynthesis.cancel();
        setIsPlayingBriefing(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(dailyBriefing);
        utterance.lang = 'tr-TR';
        utterance.onend = () => setIsPlayingBriefing(false);
        utterance.onerror = () => setIsPlayingBriefing(false);
        setIsPlayingBriefing(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="w-full min-w-0 min-h-0 flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* ==================================================== */}
      {/* LEFT PANEL (Master - %36 Genişlik): Mini Takvim & Brifing */}
      {/* ==================================================== */}
      <div
        className="w-full md:w-[36%] border-r flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5"
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
        }}
      >
        {/* 1. Mini Monthly Calendar Card */}
        <div
          className="p-4 rounded-3xl border shadow-md"
          style={{ backgroundColor: theme.panel, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-bold capitalize" style={{ color: theme.textPrimary }}>
              {currentMonthYearStr}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                aria-label="Önceki Ay"
                className="p-1 rounded-lg transition-colors hover:opacity-80"
                style={{ color: theme.textMuted }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Sonraki Ay"
                className="p-1 rounded-lg transition-colors hover:opacity-80"
                style={{ color: theme.textMuted }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold" style={{ color: theme.textSubtle }}>
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="h-7" />;
              const isSelected = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, new Date());
              const hasEvents = events.some((e) => isSameDay(new Date(e.startTime), d));

              return (
                <button
                  key={i}
                  onClick={() => onSelectDate(d)}
                  className="h-7 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold"
                  style={{
                    backgroundColor: isSelected ? theme.accent : 'transparent',
                    color: isSelected ? theme.bg : isToday ? theme.accent : theme.textPrimary,
                    fontWeight: isSelected || isToday ? 'bold' : 'normal',
                  }}
                >
                  <span>{d.getDate()}</span>
                  {hasEvents && !isSelected && (
                    <span
                      className="w-1 h-1 rounded-full absolute bottom-0.5"
                      style={{ backgroundColor: theme.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Günlük AI Brifing & Sesli Oynatma Kartı */}
        <div
          className="p-4 rounded-3xl border relative overflow-hidden"
          style={{
            backgroundColor: theme.panel,
            borderColor: `${theme.accent}40`,
            boxShadow: `0 4px 20px ${theme.accent}10`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: theme.accent }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
                Günün AI Brifingi
              </span>
            </div>

            <button
              id="speak-briefing-btn"
              onClick={speakBriefing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: isPlayingBriefing ? theme.accent : `${theme.accent}20`,
                color: isPlayingBriefing ? theme.bg : theme.accent,
                border: `1px solid ${theme.accent}50`,
              }}
            >
              <Volume2 size={13} className={isPlayingBriefing ? 'animate-pulse' : ''} />
              <span>{isPlayingBriefing ? 'Durdur' : 'Seslendir'}</span>
            </button>
          </div>

          <p className="text-xs leading-relaxed font-medium" style={{ color: theme.textMuted }}>
            {dailyBriefing}
          </p>
        </div>

        {/* 3. Günlük İstatistik Kartları */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: theme.panel, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold" style={{ color: theme.textSubtle }}>
                TAMAMLANAN
              </span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black" style={{ color: theme.textPrimary }}>
              {completedCount}{' '}
              <span className="text-xs font-normal" style={{ color: theme.textMuted }}>
                / {dayEvents.length}
              </span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: theme.panel, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold" style={{ color: theme.textSubtle }}>
                BEKLEYEN
              </span>
              <Clock size={14} style={{ color: theme.warning }} />
            </div>
            <div className="text-2xl font-black" style={{ color: theme.textPrimary }}>
              {pendingCount}
            </div>
          </div>
        </div>

        {/* 4. Ekip & Ortak Çalışma Hızlı Butonu */}
        <button
          id="tablet-open-team-btn"
          onClick={onOpenTeamWorkspace}
          className="w-full p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
            >
              <Users size={18} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                Ekip & Ortak Çalışma Alanı
              </h4>
              <p className="text-[11px]" style={{ color: theme.textSubtle }}>
                {teams.length} Aktif Ekip • Görev Dağıtımı
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
            Aç
          </span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* RIGHT PANEL (Detail - %64 Genişlik): Günün Detaylı Akışı */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
        {/* Top Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between backdrop-blur-md"
          style={{ backgroundColor: `${theme.panel}BF`, borderColor: theme.border }}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
              {selectedDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
              Günün Detaylı Akışı
            </h2>
          </div>

          <button
            id="tablet-add-event-btn"
            onClick={onOpenAddEventModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: theme.accent,
              color: theme.bg,
            }}
          >
            <Plus size={16} />
            <span>Etkinlik Ekle</span>
          </button>
        </div>

        {/* Timeline Events Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28">
          {dayEvents.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <CalendarIcon size={48} style={{ color: theme.textSubtle }} className="mb-3 opacity-60" />
              <h3 className="text-base font-bold mb-1" style={{ color: theme.textPrimary }}>
                Bu gün için kayıtlı randevu bulunamadı
              </h3>
              <p className="text-xs max-w-sm mb-4" style={{ color: theme.textMuted }}>
                Aşağıdaki akışkan etkileşim barından sesli komut vererek veya klavyeyle saniyeler içinde ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {dayEvents.map((event, index) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isLast={index === dayEvents.length - 1}
                  theme={theme}
                  onToggleComplete={onToggleComplete}
                  onDeleteEvent={onDeleteEvent}
                  timeFormat={timeFormat}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Fluid Interaction Bar */}
        <div className="app-command-dock absolute bottom-0 left-0 right-0 z-20">
          <FluidInteractionBar
            theme={theme}
            isProcessingAI={isProcessingAI}
            onSendCommand={onSendCommand}
          />
        </div>
      </div>
    </div>
  );
};
