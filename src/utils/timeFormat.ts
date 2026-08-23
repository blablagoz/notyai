export type TimeFormatPreference = '12h' | '24h';

export const TIME_FORMAT_STORAGE_KEY = 'notyai_time_format';

export const readTimeFormatPreference = (): TimeFormatPreference | null => {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(TIME_FORMAT_STORAGE_KEY);
  return saved === '12h' || saved === '24h' ? saved : null;
};

export const saveTimeFormatPreference = (preference: TimeFormatPreference) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TIME_FORMAT_STORAGE_KEY, preference);
  }
};

export const formatEventTime = (iso: string, preference: TimeFormatPreference = '24h') => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--:--';

  const minutes = date.getMinutes().toString().padStart(2, '0');
  if (preference === '24h') {
    return `${date.getHours().toString().padStart(2, '0')}:${minutes}`;
  }

  const period = date.getHours() < 12 ? 'ÖÖ' : 'ÖS';
  const hour = date.getHours() % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${minutes} ${period}`;
};

const isSameLocalDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate();

export const formatEventDateLabel = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Tarih yok';
  if (isSameLocalDay(date, now)) return 'Bugün';

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (isSameLocalDay(date, tomorrow)) return 'Yarın';

  const month = date.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', '');
  return `${date.getDate()} ${month.charAt(0).toLocaleUpperCase('tr-TR')}${month.slice(1)}`;
};
