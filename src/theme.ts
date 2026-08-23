import { AppThemeMode } from './types';

export interface ThemeColors {
  bg: string;
  panel: string;
  card: string;
  border: string;
  accent: string;
  accentSoft: string;
  warning: string;
  textPrimary: string;
  textMuted: string;
  textSubtle: string;
  gradient: string;
}

export const themes: Record<AppThemeMode, ThemeColors> = {
  dark: {
    bg: '#0D1014',
    panel: '#161B22',
    card: '#1C222C',
    border: '#2C3644',
    accent: '#00F2DE',
    accentSoft: '#40C8E0',
    warning: '#FAB446',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    textSubtle: '#505E72',
    gradient: 'from-[#00F2DE] to-[#40C8E0]',
  },
  light: {
    bg: '#F8FAFC',
    panel: '#FFFFFF',
    card: '#F1F5F9',
    border: '#E2E8F0',
    accent: '#0284C7',
    accentSoft: '#0EA5E9',
    warning: '#D97706',
    textPrimary: '#0F172A',
    textMuted: '#475569',
    textSubtle: '#94A3B8',
    gradient: 'from-[#0284C7] to-[#0EA5E9]',
  },
};
