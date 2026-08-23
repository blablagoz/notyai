import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, FileText, Bell } from 'lucide-react';
import { CalendarEvent } from '../types';
import { ThemeColors } from '../theme';

interface EventModalProps {
  initialEvent?: CalendarEvent | null;
  defaultDate: Date;
  theme: ThemeColors;
  onSave: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  initialEvent,
  defaultDate,
  theme,
  onSave,
  onClose,
}) => {
  const formatInputDateTime = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const defaultStart = initialEvent ? new Date(initialEvent.startTime) : new Date(defaultDate);
  if (!initialEvent) {
    defaultStart.setHours(new Date().getHours() + 1, 0, 0, 0);
  }
  const defaultEnd = initialEvent
    ? new Date(initialEvent.endTime)
    : new Date(defaultStart.getTime() + 3600000);

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [startTime, setStartTime] = useState(formatInputDateTime(defaultStart));
  const [endTime, setEndTime] = useState(formatInputDateTime(defaultEnd));
  const [category, setCategory] = useState(initialEvent?.category || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    initialEvent?.reminderMinutesBefore || 60
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [categoryHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('notyai_category_history') || '[]'); }
    catch { return []; }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (new Date(endTime) <= new Date(startTime)) { setError('Bitiş zamanı başlangıçtan sonra olmalıdır.'); return; }
    setIsSaving(true); setError('');
    try {
      await onSave({ title: title.trim(), startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString(),
        category: category.trim(), location: location.trim() || undefined, description: description.trim() || undefined,
        reminderMinutesBefore: Number(reminderMinutesBefore), isCompleted: initialEvent?.isCompleted || false,
        teamId: initialEvent?.teamId, teamName: initialEvent?.teamName });
      const nextHistory = [category.trim(), ...categoryHistory.filter((item) => item.toLocaleLowerCase('tr-TR') !== category.trim().toLocaleLowerCase('tr-TR'))].filter(Boolean).slice(0, 12);
      localStorage.setItem('notyai_category_history', JSON.stringify(nextHistory));
      onClose();
    } catch (err: any) { setError(err.message || 'Etkinlik kaydedilemedi.'); }
    finally { setIsSaving(false); }
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
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                {initialEvent ? 'Etkinliği Düzenle' : 'Yeni Randevu / Etkinlik Ekle'}
              </h3>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Zaman çizelgesine doğrudan kayıt oluşturun
              </p>
            </div>
          </div>

          <button
            id="close-event-modal-btn"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.card, color: theme.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
              ETKİNLİK BAŞLIĞI *
            </label>
            <input
              id="event-title-input"
              type="text"
              required
              autoFocus
              placeholder="Örn: İş Toplantısı, Spor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border text-sm font-medium outline-none"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            />
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                BAŞLANGIÇ ZAMANI
              </label>
              <input
                id="event-start-time-input"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 rounded-xl border text-xs font-medium outline-none"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
                BİTİŞ ZAMANI
              </label>
              <input
                id="event-end-time-input"
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-3 rounded-xl border text-xs font-medium outline-none"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMuted }}>
              KATEGORİ
            </label>
            <input id="event-category-input" type="text" required list="notyai-category-suggestions" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategorinizi yazın" className="w-full p-3 rounded-xl border text-sm font-medium outline-none" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }}/>
            <datalist id="notyai-category-suggestions">{categoryHistory.map((item) => <option key={item} value={item}/>)}</datalist>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
              KONUM / YER (OPSİYONEL)
            </label>
            <div className="relative">
              <input
                id="event-location-input"
                type="text"
                placeholder="Örn: Ofis, Zoom, Ev, Market"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl border text-sm font-medium outline-none"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
              <MapPin size={16} className="absolute left-3.5 top-3.5" style={{ color: theme.accent }} />
            </div>
          </div>

          {/* Reminder Buffer */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
              NE KADAR SÜRE KALA HATIRLATSIN?
            </label>
            <select
              id="event-reminder-select"
              value={reminderMinutesBefore}
              onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
              className="w-full p-3 rounded-xl border text-sm font-medium outline-none"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <option value={15}>15 dakika kala</option>
              <option value={30}>Yarım saat kala</option>
              <option value={60}>1 saat kala</option>
              <option value={120}>2 saat kala</option>
              <option value={1440}>1 Gün Önce</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: theme.textMuted }}>
              AÇIKLAMA / ASİSTAN NOTLARI
            </label>
            <textarea
              id="event-description-input"
              rows={2}
              placeholder="Ek notlar, dosya numarası veya detaylar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border text-sm font-medium outline-none resize-none"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            />
          </div>

          {/* Submit */}
          {error && <p className="text-xs p-3 rounded-xl" style={{ backgroundColor: theme.card, color: theme.warning }}>{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: theme.border }}>
            <button
              type="button"
              id="cancel-event-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors hover:opacity-80"
              style={{ color: theme.textMuted }}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              id="save-event-btn"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-60"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
              }}
            >
              {isSaving ? 'Kaydediliyor…' : initialEvent ? 'Güncelle' : 'Kaydet & Takvime Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
