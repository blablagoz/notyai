import { AppThemeMode } from '../types';

const THEME_KEY = 'notyai_theme';
const THEME_SELECTED_KEY = 'notyai_theme_selected';

export function readThemePreference(): AppThemeMode {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  // Eski koyu tema adlarını yeni Gece seçeneğine güvenle taşı.
  if (saved === 'obsidian' || saved === 'petrol') return 'dark';
  return 'light';
}

export function hasSelectedThemePreference(): boolean {
  return localStorage.getItem(THEME_SELECTED_KEY) === 'true';
}

export function saveThemePreference(theme: AppThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(THEME_SELECTED_KEY, 'true');
}
