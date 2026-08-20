import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, FileText, Bell } from 'lucide-react';
import { CalendarEvent } from '../types';
import { ThemeColors } from '../theme';

interface EventModalProps {
  initialEvent?: CalendarEvent | null;
  defaultDate: Date;
  theme: ThemeColors;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
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
  const [category, setCategory] = useState(initialEvent?.category || 'Genel');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    initialEvent?.reminderMinutesBefore || 60
  );

  const categories = ['Hukuk', 'Resmi', 'Toplantı', 'Spor', 'Sağlık', 'Ders', 'Kişisel', 'Ekip'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      category,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      reminderMinutesBefore: Number(reminderMinutesBefore),
      isCompleted: initialEvent?.isCompleted || false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl border p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
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
              placeholder="Örn: Kadıköy Noterliği İmzası..."
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
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  id={`cat-select-${cat}`}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: category === cat ? theme.accent : theme.card,
                    color: category === cat ? theme.bg : theme.textMuted,
                    border: `1px solid ${category === cat ? theme.accent : theme.border}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
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
                placeholder="Örn: Kadıköy Adliyesi, Zoom, Ofis..."
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
              HATIRLATICI TAMPONU
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
              <option value={15}>T-15 Dakika Önce</option>
              <option value={30}>T-30 Dakika Önce</option>
              <option value={60}>T-60 Dakika Önce (Önerilen Yol Tamponu)</option>
              <option value={120}>T-2 Saat Önce</option>
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
              }}
            >
              {initialEvent ? 'Güncelle' : 'Kaydet & Takvime Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
