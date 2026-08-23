import React from 'react';
import { Clock3 } from 'lucide-react';
import { ThemeColors } from '../theme';
import { TimeFormatPreference } from '../utils/timeFormat';

interface TimeFormatPromptProps {
  theme: ThemeColors;
  onSelect: (preference: TimeFormatPreference) => void;
}

export const TimeFormatPrompt: React.FC<TimeFormatPromptProps> = ({ theme, onSelect }) => (
  <div className="app-modal-layer fixed inset-0 z-[70] bg-black/70 flex items-center justify-center backdrop-blur-sm">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-format-title"
      className="app-modal-panel w-full max-w-md rounded-3xl border p-5 sm:p-6 shadow-2xl"
      style={{ backgroundColor: theme.panel, borderColor: theme.border }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
      >
        <Clock3 size={22} />
      </div>
      <h2 id="time-format-title" className="text-xl font-black" style={{ color: theme.textPrimary }}>
        Saat gösterimini seçin
      </h2>
      <p className="text-sm mt-1 mb-5" style={{ color: theme.textMuted }}>
        Bu tercihi daha sonra Ayarlar bölümünden değiştirebilirsiniz.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect('24h')}
          className="p-4 rounded-2xl border text-left transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: theme.card, borderColor: theme.accent }}
        >
          <span className="block text-sm font-bold" style={{ color: theme.textPrimary }}>24 saat</span>
          <span className="text-xs" style={{ color: theme.accent }}>15:00 – 16:00</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('12h')}
          className="p-4 rounded-2xl border text-left transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <span className="block text-sm font-bold" style={{ color: theme.textPrimary }}>12 saat</span>
          <span className="text-xs" style={{ color: theme.accent }}>03:00 ÖS – 04:00 ÖS</span>
        </button>
      </div>
    </section>
  </div>
);
