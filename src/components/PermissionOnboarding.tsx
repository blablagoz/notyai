import React, { useEffect, useState } from 'react';
import { BellRing, CalendarDays, CheckCircle2, Mic, ShieldCheck } from 'lucide-react';
import { ThemeColors } from '../theme';
import {
  getRequiredPermissionStatuses,
  hasSeenPermissionOnboarding,
  markPermissionOnboardingSeen,
  requestRequiredPermissions,
  RequiredPermission,
  RequiredPermissionStatuses,
  supportsRequiredPermissionOnboarding,
} from '../services/permissions';

const permissionRows: Array<{
  id: RequiredPermission;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  {
    id: 'calendar',
    title: 'Takvim erişimi',
    description: 'Etkinlikleri telefonunuzun yerel takvimiyle eşitler.',
    icon: CalendarDays,
  },
  {
    id: 'notifications',
    title: 'Bildirim izni',
    description: 'Hatırlatmaları etkinlik zamanı geldiğinde gösterir.',
    icon: BellRing,
  },
  {
    id: 'microphone',
    title: 'Mikrofon erişimi',
    description: 'Sesli komutları dinleyip göreve dönüştürür.',
    icon: Mic,
  },
];

const initialStatuses: RequiredPermissionStatuses = {
  calendar: 'prompt',
  notifications: 'prompt',
  microphone: 'prompt',
};

export function PermissionOnboarding({
  theme,
  onComplete,
}: {
  theme: ThemeColors;
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(
    () => supportsRequiredPermissionOnboarding() && !hasSeenPermissionOnboarding(),
  );
  const [statuses, setStatuses] = useState<RequiredPermissionStatuses>(initialStatuses);
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!visible) return;
    getRequiredPermissionStatuses().then(setStatuses);
  }, [visible]);

  if (!visible) return null;

  const close = () => {
    markPermissionOnboardingSeen();
    setVisible(false);
    onComplete?.();
  };

  const requestAll = async () => {
    setBusy(true);
    setRequested(true);
    try {
      const finalStatuses = await requestRequiredPermissions((permission, granted) => {
        setStatuses((current) => ({
          ...current,
          [permission]: granted ? 'granted' : 'denied',
        }));
      });
      setStatuses(finalStatuses);
    } finally {
      setBusy(false);
    }
  };

  const allGranted = permissionRows.every((item) => statuses[item.id] === 'granted');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: `${theme.bg}F2` }}>
      <section className="w-full max-w-md rounded-3xl border p-5 shadow-2xl" style={{ backgroundColor: theme.panel, borderColor: theme.border, color: theme.textPrimary }}>
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl p-3" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
            <ShieldCheck size={25} />
          </div>
          <div>
            <h2 className="text-xl font-black">NotyAI'yi kullanıma hazırlayın</h2>
            <p className="mt-1 text-xs leading-5" style={{ color: theme.textMuted }}>
              Takvim eşitleme, zamanında bildirim ve sesli komutlar için aşağıdaki cihaz izinleri gerekir.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {permissionRows.map((item) => {
            const Icon = item.icon;
            const granted = statuses[item.id] === 'granted';
            const denied = statuses[item.id] === 'denied';
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border p-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <Icon size={20} color={theme.accent} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-[11px] leading-4" style={{ color: theme.textMuted }}>{item.description}</p>
                </div>
                {granted && <CheckCircle2 size={19} color={theme.accent} aria-label="İzin verildi" />}
                {denied && <span className="text-[10px] font-bold" style={{ color: theme.warning }}>Reddedildi</span>}
              </div>
            );
          })}
        </div>

        {!requested || (!allGranted && !busy) ? (
          <button
            type="button"
            disabled={busy}
            onClick={requestAll}
            className="mt-5 w-full rounded-2xl py-3 text-sm font-black disabled:opacity-60"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            {busy ? 'İzinler isteniyor…' : requested ? 'İzinleri yeniden iste' : 'İzinleri ver'}
          </button>
        ) : null}

        {(requested || allGranted) && (
          <button
            type="button"
            disabled={busy}
            onClick={close}
            className="mt-2 w-full rounded-2xl border py-3 text-sm font-bold disabled:opacity-60"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          >
            {allGranted ? 'Devam et' : 'Bu izinlerle devam et'}
          </button>
        )}

        {!requested && (
          <button type="button" onClick={close} className="mt-3 w-full py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>
            Şimdi değil
          </button>
        )}
      </section>
    </div>
  );
}
