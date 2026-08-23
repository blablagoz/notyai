import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeColors } from '../theme';
import { AppThemeMode } from '../types';

interface ThemeModePromptProps {
  theme: ThemeColors;
  onSelect: (mode: AppThemeMode) => void;
}

export const ThemeModePrompt: React.FC<ThemeModePromptProps> = ({ theme, onSelect }) => (
  <div className="app-modal-layer fixed inset-0 z-[80] bg-black/70 flex items-center justify-center backdrop-blur-sm p-4">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-mode-title"
      className="app-modal-panel w-full max-w-md rounded-3xl border p-5 sm:p-6 shadow-2xl"
      style={{ backgroundColor: theme.panel, borderColor: theme.border }}
    >
      <h2 id="theme-mode-title" className="text-xl font-black" style={{ color: theme.textPrimary }}>
        Görünüm modunu seçin
      </h2>
      <p className="text-sm mt-1 mb-5" style={{ color: theme.textMuted }}>
        Tercihinizi daha sonra Ayarlar bölümünden değiştirebilirsiniz.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onSelect('light')} className="p-4 rounded-2xl border text-left" style={{ backgroundColor: '#F8FAFC', borderColor: '#0284C7', color: '#0F172A' }}>
          <Sun size={20} className="mb-3 text-sky-600" />
          <strong className="block text-sm">Aydınlık</strong>
          <span className="text-xs text-slate-600">Mavi – Beyaz</span>
        </button>
        <button type="button" onClick={() => onSelect('dark')} className="p-4 rounded-2xl border text-left" style={{ backgroundColor: '#0D1014', borderColor: '#00F2DE', color: '#F8FAFC' }}>
          <Moon size={20} className="mb-3 text-cyan-300" />
          <strong className="block text-sm">Gece</strong>
          <span className="text-xs text-slate-400">Koyu görünüm</span>
        </button>
      </div>
    </section>
  </div>
);
