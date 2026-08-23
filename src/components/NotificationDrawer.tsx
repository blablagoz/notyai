import React from 'react';
import { X, Bell, Moon, Sun, Clock, Check } from 'lucide-react';
import { NotificationItem } from '../types';
import { ThemeColors } from '../theme';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  theme: ThemeColors;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  theme,
  onMarkAllRead,
  onClose,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'morning':
        return <Sun size={18} className="text-amber-400" />;
      case 'summary':
        return <Moon size={18} className="text-indigo-400" />;
      case 'reminder':
        return <Clock size={18} className="text-emerald-400" />;
      default:
        return <Bell size={18} style={{ color: theme.accent }} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="app-drawer-panel w-full max-w-md shadow-2xl flex flex-col justify-between border-l overflow-y-auto animate-in slide-in-from-right duration-200"
        style={{
          backgroundColor: theme.panel,
          borderColor: theme.border,
        }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <Bell size={20} style={{ color: theme.accent }} />
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Bildirimler & Brifingler
              </h3>
            </div>
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:opacity-80"
              style={{ backgroundColor: theme.card, color: theme.textMuted }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSubtle }}>
              Son Aktiviteler
            </span>
            <button
              id="mark-all-read-btn"
              onClick={onMarkAllRead}
              className="text-xs font-semibold flex items-center gap-1 hover:underline"
              style={{ color: theme.accent }}
            >
              <Check size={13} />
              <span>Tümünü Okundu Say</span>
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border transition-all"
                style={{
                  backgroundColor: item.isRead ? theme.card : `${theme.card}F0`,
                  borderColor: item.isRead ? theme.border : `${theme.accent}60`,
                  boxShadow: item.isRead ? 'none' : `0 2px 10px ${theme.accent}15`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-xl shrink-0 mt-0.5"
                    style={{ backgroundColor: theme.panel }}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono" style={{ color: theme.textSubtle }}>
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t text-center" style={{ borderColor: theme.border }}>
          <p className="text-[11px]" style={{ color: theme.textSubtle }}>
            NotyAI 3 Kademeli Akıllı Bildirim Mimarisi Aktif
          </p>
        </div>
      </div>
    </div>
  );
};
