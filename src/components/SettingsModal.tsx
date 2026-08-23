import React from 'react';
import { X, CheckCircle2, Download, Sparkles, Moon, Sun, Bell, ShieldCheck, Clock3, LogOut } from 'lucide-react';
import { AppThemeMode, CalendarEvent } from '../types';
import { ThemeColors } from '../theme';
import { TimeFormatPreference } from '../utils/timeFormat';

interface SettingsModalProps {
  currentTheme: AppThemeMode;
  onThemeChange: (mode: AppThemeMode) => void;
  theme: ThemeColors;
  events: CalendarEvent[];
  onClose: () => void;
  timeFormat?: TimeFormatPreference;
  onTimeFormatChange?: (preference: TimeFormatPreference) => void;
  onSignOut?: () => void | Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentTheme,
  onThemeChange,
  theme,
  events,
  onClose,
  timeFormat = '24h',
  onTimeFormatChange,
  onSignOut,
}) => {
  const exportICS = () => {
    // Generate standard .ics (iCalendar) format
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NotyAI//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach((event) => {
      const formatIcsDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${event.id}@notyai.app`);
      icsContent.push(`DTSTAMP:${formatIcsDate(new Date().toISOString())}`);
      icsContent.push(`DTSTART:${formatIcsDate(event.startTime)}`);
      icsContent.push(`DTEND:${formatIcsDate(event.endTime)}`);
      icsContent.push(`SUMMARY:${event.title}`);
      if (event.description) icsContent.push(`DESCRIPTION:${event.description}`);
      if (event.location) icsContent.push(`LOCATION:${event.location}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notyai_takvim_aktarimi.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-modal-layer fixed inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="app-modal-panel w-full max-w-lg rounded-3xl border p-4 sm:p-6 shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: theme.panel,
          borderColor: theme.border,
        }}
      >
        {/* Modal Handle & Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Uygulama Tercihleri
              </h3>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                NotyAI Sistem & Görünüm Yapılandırması
              </p>
            </div>
          </div>

          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.card, color: theme.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Saat gösterimi */}
        <div className="mt-6">
          <label className="text-[11px] font-bold tracking-widest uppercase block mb-3" style={{ color: theme.textSubtle }}>
            SAAT GÖSTERİMİ
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(['24h', '12h'] as const).map((preference) => {
              const selected = timeFormat === preference;
              return (
                <button
                  key={preference}
                  type="button"
                  onClick={() => onTimeFormatChange?.(preference)}
                  className="p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all"
                  style={{
                    backgroundColor: selected ? `${theme.accent}15` : theme.card,
                    borderColor: selected ? theme.accent : theme.border,
                    color: selected ? theme.accent : theme.textPrimary,
                  }}
                >
                  <Clock3 size={17} />
                  <span>
                    <strong className="block text-xs">{preference === '24h' ? '24 saat' : '12 saat'}</strong>
                    <span className="text-[11px]">{preference === '24h' ? '15:00' : '03:00 ÖS'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Theme Selection */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-widest uppercase block mb-3" style={{ color: theme.textSubtle }}>
            TEMA SEÇİMİ
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="theme-btn-light"
              onClick={() => onThemeChange('light')}
              className="p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group border"
              style={{
                backgroundColor: '#F8FAFC',
                borderColor: currentTheme === 'light' ? '#0284C7' : '#E2E8F0',
                boxShadow: currentTheme === 'light' ? '0 0 16px rgba(2, 132, 199, 0.35)' : 'none',
              }}
            >
              <div className="w-4 h-4 rounded-full mb-2 bg-[#0284C7]" />
              <span className="text-xs font-bold text-slate-900">Aydınlık</span>
              <span className="text-[10px] text-slate-600">Mavi – Beyaz</span>
            </button>

            <button
              id="theme-btn-dark"
              onClick={() => onThemeChange('dark')}
              className="p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group border"
              style={{
                backgroundColor: '#0D1014',
                borderColor: currentTheme === 'dark' ? '#00F2DE' : '#2C3644',
                boxShadow: currentTheme === 'dark' ? '0 0 16px rgba(0, 242, 222, 0.35)' : 'none',
              }}
            >
              <div className="w-4 h-4 rounded-full mb-2 bg-[#00F2DE]" />
              <span className="text-xs font-bold text-slate-100">Gece</span>
              <span className="text-[10px] text-slate-400">Koyu Görünüm</span>
            </button>
          </div>
        </div>

        {/* 2. Notification Architecture */}
        <div className="mt-6">
          <label className="text-[11px] font-bold tracking-widest uppercase block mb-3" style={{ color: theme.textSubtle }}>
            GERÇEK ANDROID ETKİNLİK BİLDİRİMLERİ
          </label>
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                  <Moon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                    Seçilen Süre Kala Hatırlatma
                  </h4>
                  <p className="text-[11px]" style={{ color: theme.textMuted }}>
                    15 dk, 30 dk, 1 saat, 2 saat veya 1 gün önce
                  </p>
                </div>
              </div>
              <CheckCircle2 size={18} style={{ color: theme.accent }} />
            </div>

            <div className="p-3.5 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400">
                  <Sun size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                    Etkinlik Zamanı Bildirimi
                  </h4>
                  <p className="text-[11px]" style={{ color: theme.accent }}>
                    Etkinlik başladığı anda Android sistem bildirimi
                  </p>
                </div>
              </div>
              <CheckCircle2 size={18} style={{ color: theme.accent }} />
            </div>

            <div className="p-3.5 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                  <Bell size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                    Kesin Alarm ve Yeniden Başlatma Desteği
                  </h4>
                  <p className="text-[11px]" style={{ color: theme.textMuted }}>
                    İzin verildiğinde bekleme modunda zamanında teslim
                  </p>
                </div>
              </div>
              <CheckCircle2 size={18} style={{ color: theme.accent }} />
            </div>
          </div>
        </div>

        {/* 3. Calendar Sync (.ICS Export) */}
        <div className="mt-6">
          <label className="text-[11px] font-bold tracking-widest uppercase block mb-3" style={{ color: theme.textSubtle }}>
            CİHAZ TAKVİMİ SENKRONİZASYONU
          </label>
          <div className="p-4 rounded-2xl border flex items-center justify-between gap-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div>
              <h4 className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                Yerel Takvim + iCalendar (.ICS) Dışa Aktarma
              </h4>
              <p className="text-[11px]" style={{ color: theme.textMuted }}>
                Android CalendarContract uyumlu cihaz takvimlerine doğrudan kayıt eklenir
              </p>
            </div>

            <button
              id="export-ics-btn"
              onClick={exportICS}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all hover:scale-105"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
              }}
            >
              <Download size={14} />
              <span>İndir (.ics)</span>
            </button>
          </div>
        </div>

        {onSignOut && (
          <div className="mt-6 pt-5 border-t" style={{ borderColor: theme.border }}>
            <button
              id="settings-sign-out-btn"
              type="button"
              onClick={() => void onSignOut()}
              className="w-full p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: '#EF444415', borderColor: '#EF444450', color: '#F87171' }}
            >
              <LogOut size={17} />
              Oturumu Kapat
            </button>
          </div>
        )}

        {/* 4. AI Engine Status */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: theme.accent }} />
            <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>
              Yerel Türkçe Ses Tanıma ve Güvenli Komut Ayrıştırıcı Aktif
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
};
