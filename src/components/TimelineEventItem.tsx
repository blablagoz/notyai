import React from 'react';
import { Check, CheckCircle2, Circle, Clock, MapPin, Bell, Trash2, CalendarClock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CalendarEvent } from '../types';
import { ThemeColors } from '../theme';

interface TimelineEventItemProps {
  event: CalendarEvent;
  isLast: boolean;
  theme: ThemeColors;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onRescheduleEvent: (id: string, hours: number) => void;
}

export const TimelineEventItem: React.FC<TimelineEventItemProps> = ({
  event,
  isLast,
  theme,
  onToggleComplete,
  onDeleteEvent,
  onRescheduleEvent,
}) => {
  const isCompleted = !!event.isCompleted;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  const startTimeStr = formatTime(event.startTime);
  const endTimeStr = formatTime(event.endTime);

  const getCategoryBadgeStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hukuk':
        return { bg: '#6366F120', border: '#6366F150', text: '#818CF8' };
      case 'resmi':
        return { bg: '#F59E0B20', border: '#F59E0B50', text: '#FBBF24' };
      case 'toplantı':
        return { bg: '#06B6D420', border: '#06B6D450', text: '#22D3EE' };
      case 'spor':
        return { bg: '#10B98120', border: '#10B98150', text: '#34D399' };
      case 'sağlık':
        return { bg: '#EC489920', border: '#EC489950', text: '#F472B6' };
      case 'ders':
        return { bg: '#8B5CF620', border: '#8B5CF650', text: '#A78BFA' };
      case 'ekip':
        return { bg: '#3B82F620', border: '#3B82F650', text: '#60A5FA' };
      default:
        return { bg: `${theme.accent}15`, border: `${theme.accent}40`, text: theme.accent };
    }
  };

  const catStyle = getCategoryBadgeStyle(event.category || 'Genel');

  const handleToggle = () => {
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00F2DE', '#10F0D2', '#22c55e', '#3b82f6'],
        });
      } catch {
        // Safe fallback
      }
    }
    onToggleComplete(event.id);
  };

  return (
    <div className="flex items-start group relative">
      {/* Left Timeline Indicator & Vertical Line */}
      <div className="w-12 sm:w-14 flex flex-col items-center shrink-0">
        <button
          onClick={handleToggle}
          aria-label={isCompleted ? "Geri Al" : "Tamamla"}
          className="w-5 h-5 mt-1 rounded-full flex items-center justify-center transition-transform hover:scale-110 z-10"
          style={{
            backgroundColor: isCompleted ? '#22C55E' : theme.panel,
            border: `2px solid ${isCompleted ? '#22C55E' : theme.accent}`,
            boxShadow: !isCompleted ? `0 0 8px ${theme.accent}60` : 'none',
          }}
        >
          {isCompleted && <Check size={11} className="text-black stroke-[3]" />}
        </button>

        {!isLast && (
          <div
            className="w-0.5 min-h-[90px] h-full my-1 transition-colors"
            style={{
              backgroundColor: isCompleted ? '#22C55E40' : theme.border,
            }}
          />
        )}
      </div>

      {/* Right Event Card */}
      <div
        className="flex-1 mb-4 sm:mb-5 p-4 sm:p-5 rounded-2xl transition-all duration-200"
        style={{
          backgroundColor: isCompleted ? `${theme.panel}90` : theme.card,
          border: `1px solid ${isCompleted ? '#22C55E35' : theme.border}`,
          boxShadow: isCompleted ? 'none' : '0 4px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          {/* Time & Category Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-tight"
              style={{
                backgroundColor: isCompleted ? '#22C55E15' : `${theme.accent}15`,
                color: isCompleted ? '#22C55E' : theme.accent,
                border: `1px solid ${isCompleted ? '#22C55E30' : `${theme.accent}30`}`,
              }}
            >
              <Clock size={12} />
              <span>
                {startTimeStr} - {endTimeStr}
              </span>
            </div>

            <span
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
              style={{
                backgroundColor: catStyle.bg,
                border: `1px solid ${catStyle.border}`,
                color: catStyle.text,
              }}
            >
              {event.category || 'Genel'}
            </span>

            {event.teamName && (
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                style={{
                  backgroundColor: '#3B82F615',
                  border: '1px solid #3B82F640',
                  color: '#60A5FA',
                }}
              >
                👥 {event.teamName}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Reschedule 1 hr button */}
            <button
              id={`reschedule-btn-${event.id}`}
              onClick={() => onRescheduleEvent(event.id, 1)}
              title="1 Saat Ötele"
              className="p-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90 flex items-center gap-1"
              style={{
                backgroundColor: theme.panel,
                color: theme.textSubtle,
                border: `1px solid ${theme.border}`,
              }}
            >
              <CalendarClock size={13} />
              <span className="hidden sm:inline text-[11px]">+1 Saat</span>
            </button>

            {/* Toggle Completion Button */}
            <button
              id={`toggle-complete-btn-${event.id}`}
              onClick={handleToggle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: isCompleted ? '#22C55E20' : theme.panel,
                border: `1px solid ${isCompleted ? '#22C55E' : theme.border}`,
                color: isCompleted ? '#22C55E' : theme.textMuted,
              }}
            >
              {isCompleted ? (
                <CheckCircle2 size={13} className="text-emerald-400" />
              ) : (
                <Circle size={13} />
              )}
              <span>{isCompleted ? 'Tamamlandı' : 'Tamamla'}</span>
            </button>

            {/* Delete button */}
            <button
              id={`delete-btn-${event.id}`}
              onClick={() => onDeleteEvent(event.id)}
              aria-label="Randevuyu Sil"
              className="p-1.5 rounded-lg text-xs transition-colors hover:text-red-400 opacity-60 hover:opacity-100"
              style={{ color: theme.textMuted }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-base sm:text-lg font-bold tracking-tight mb-1"
          style={{
            color: isCompleted ? theme.textMuted : theme.textPrimary,
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {event.title || 'İsimsiz Etkinlik'}
        </h3>

        {/* Description */}
        {event.description && (
          <p
            className="text-xs sm:text-sm mb-2.5 leading-relaxed line-clamp-2"
            style={{ color: theme.textSubtle }}
          >
            {event.description}
          </p>
        )}

        {/* Meta row: Location & Reminders */}
        <div className="flex items-center gap-3 text-xs flex-wrap pt-1 border-t border-opacity-5" style={{ borderColor: theme.border }}>
          {event.location && (
            <div className="flex items-center gap-1 font-medium" style={{ color: theme.textMuted }}>
              <MapPin size={13} style={{ color: theme.accent }} />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-1" style={{ color: theme.textSubtle }}>
            <Bell size={12} />
            <span>T-{event.reminderMinutesBefore || 60} dk Hatırlatıcı</span>
          </div>
        </div>
      </div>
    </div>
  );
};
