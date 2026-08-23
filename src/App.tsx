import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Settings,
  Users,
  Bell,
  Plus,
  Columns,
  Smartphone,
  Calendar as CalendarIcon,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { AppThemeMode, CalendarEvent, TeamModel, FriendShare, NotificationItem, TeamInvitation, UserProfile } from './types';
import { themes, ThemeColors } from './theme';
import { supabase } from './lib/supabase';
import { initializeOAuthDeepLinks } from './services/auth';
import { addTeamReminder, createTeam, findProfile, inviteMember, loadEvents, loadInvitations, loadNotifications, loadProfile, loadTeams, markAllNotificationsRead, removeEvent, respondInvitation, saveEvent, updateEvent } from './services/data';
import { removeEventFromDevice, syncEventToDevice } from './services/eventSync';
import { AuthScreen } from './components/AuthScreen';
import { WeeklyFlowBar } from './components/WeeklyFlowBar';
import { TimelineEventItem } from './components/TimelineEventItem';
import { FluidInteractionBar } from './components/FluidInteractionBar';
import { LiveTranscriptOverlay } from './components/LiveTranscriptOverlay';
import { TabletSplitLayout } from './components/TabletSplitLayout';
import { TeamWorkspaceScreen } from './components/TeamWorkspaceScreen';
import { SettingsModal } from './components/SettingsModal';
import { EventModal } from './components/EventModal';
import { NotificationDrawer } from './components/NotificationDrawer';

export function App() {
  // Theme state
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => {
    const saved = localStorage.getItem('notyai_theme');
    return (saved as AppThemeMode) || 'obsidian';
  });

  const currentTheme: ThemeColors = themes[themeMode];

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teams, setTeams] = useState<TeamModel[]>([]);
  const [friends] = useState<FriendShare[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [dataError, setDataError] = useState('');

  // Active selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Layout mode: dual-pane split vs single mobile flow
  const [isSplitLayout, setIsSplitLayout] = useState<boolean>(() => {
    return window.innerWidth >= 1024;
  });

  // AI & Voice interaction states
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [assistantSummary, setAssistantSummary] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeamWorkspaceOpen, setIsTeamWorkspaceOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Daily AI briefing text
  const [dailyBriefing, setDailyBriefing] = useState<string>(
    'Gününüzün akışı hazırlandı. Planlarınıza zamanında yetişmeniz için 3 kademeli bildirim mimarisi devrede!'
  );

  useEffect(() => {
    localStorage.setItem('notyai_theme', themeMode);
  }, [themeMode]);

  const refreshData = useCallback(async (activeUserId: string) => {
    try {
      setDataError('');
      const [nextProfile, nextEvents, nextTeams, nextInvites, nextNotifications] = await Promise.all([
        loadProfile(activeUserId), loadEvents(), loadTeams(), loadInvitations(), loadNotifications(),
      ]);
      setProfile(nextProfile); setEvents(nextEvents); setTeams(nextTeams);
      setPendingInvitations(nextInvites); setNotifications(nextNotifications);
    } catch (error: any) { setDataError(error.message || 'Veriler eşitlenemedi.'); }
  }, []);

  useEffect(() => {
    initializeOAuthDeepLinks();
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id || null; setUserId(id); setAuthLoading(false); if (id) refreshData(id);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id || null; setUserId(id); setAuthLoading(false);
      if (id) refreshData(id); else { setProfile(null); setEvents([]); setTeams([]); setPendingInvitations([]); }
    });
    return () => data.subscription.unsubscribe();
  }, [refreshData]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`notyai-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` }, () => refreshData(userId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_invitations', filter: `invitee_id=eq.${userId}` }, () => refreshData(userId))
      .subscribe();
    const onVisible = () => { if (document.visibilityState === 'visible') refreshData(userId); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); supabase.removeChannel(channel); };
  }, [userId, refreshData]);

  // Sync window resize for layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSplitLayout(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Daily briefing remains local so APK does not depend on an unavailable localhost API.
  useEffect(() => {
    const count = events.filter((e) => isSameDay(new Date(e.startTime), selectedDate)).length;
    setDailyBriefing(count ? `Bugün ${count} etkinliğiniz var. Takvim ve bildirimleriniz cihazınızla eşitlendi.` : 'Bugün için planlanmış etkinliğiniz yok.');
  }, [selectedDate, events]);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Toggle event completion
  const handleToggleComplete = async (id: string) => {
    const current = events.find((e) => e.id === id); if (!current) return;
    await updateEvent(id, { is_completed: !current.isCompleted });
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  };

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    const current = events.find((e) => e.id === id); if (!current) return;
    await removeEventFromDevice(current); await removeEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Reschedule event by hours
  const handleRescheduleEvent = async (id: string, hours: number) => {
    const current = events.find((e) => e.id === id); if (!current) return;
    const shifted = { ...current, startTime: new Date(new Date(current.startTime).getTime() + hours * 3600000).toISOString(), endTime: new Date(new Date(current.endTime).getTime() + hours * 3600000).toISOString() };
    const native: Partial<CalendarEvent> = await syncEventToDevice(shifted).catch(() => ({}));
    await updateEvent(id, { start_time: shifted.startTime, end_time: shifted.endTime, native_calendar_event_id: native.nativeCalendarEventId || null, local_notification_id: native.localNotificationId ?? null });
    setEvents((prev) => prev.map((e) => e.id === id ? { ...shifted, ...native } : e));
    setAssistantSummary(`Etkinlik ${hours} saat sonraya ötelendi.`);
  };

  // Process NLP / Voice command
  const handleSendCommand = async (commandText: string) => {
    setIsProcessingAI(true);
    setLiveTranscript(commandText);

    try {
      // Mobil APK localhost sunucusuna bağlı değildir; komutu güvenli yerel ayrıştırıcı işler.
      throw new Error('local-parser');
      const response = await fetch('/api/parse-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: commandText,
          referenceTime: selectedDate.toISOString(),
        }),
      });

      const data = await response.json();
      if (data?.event) {
        const parsed = data.event;

        if (parsed.isReschedule) {
          const hours = parsed.rescheduleHours || 1;
          setEvents((prev) =>
            prev.map((e) => {
              const eventDate = new Date(e.startTime);
              if (isSameDay(eventDate, selectedDate) && !e.isCompleted) {
                const s = new Date(e.startTime);
                const end = new Date(e.endTime);
                s.setHours(s.getHours() + hours);
                end.setHours(end.getHours() + hours);
                return { ...e, startTime: s.toISOString(), endTime: end.toISOString() };
              }
              return e;
            })
          );
          setAssistantSummary(parsed.assistantSummary || `Bugünkü tüm işler ${hours} saat ötelendi.`);
        } else {
          const newEv: CalendarEvent = {
            id: `ev-${Date.now()}`,
            title: parsed.title || commandText,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
            reminderMinutesBefore: parsed.reminderMinutesBefore || 60,
            category: parsed.category || 'Genel',
            location: parsed.location,
            description: parsed.description || 'NotyAI Türkçe Asistanı ile eklendi',
            isCompleted: false,
          };

          setEvents((prev) => [...prev, newEv]);

          // Automatically switch selectedDate to event start date
          const eventDate = new Date(newEv.startTime);
          setSelectedDate(eventDate);

          setAssistantSummary(parsed.assistantSummary || `Takvime eklendi: ${newEv.title}`);
        }
      }
    } catch (err: any) {
      console.error('NLP Command error:', err);
      // Fallback manual event creation
      const normalized = commandText.toLocaleLowerCase('tr-TR');
      const start = new Date(selectedDate);
      if (normalized.includes('yarın')) start.setDate(start.getDate() + 1);
      const spokenTime = normalized.match(/(?:saat\s*)?(\d{1,2})[.:](\d{2})/);
      if (spokenTime) start.setHours(Number(spokenTime[1]), Number(spokenTime[2]), 0, 0);
      else start.setHours(new Date().getHours() + 1, 0, 0, 0);
      const end = new Date(start.getTime() + 3600000);

      const fallbackEv: CalendarEvent = {
        id: `ev-${Date.now()}`,
        title: commandText,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        reminderMinutesBefore: 60,
        category: 'Genel',
        isCompleted: false,
      };
      if (!userId) throw new Error('Oturum bulunamadı.');
      const stored = await saveEvent(userId, fallbackEv);
      const native: Partial<CalendarEvent> = await syncEventToDevice(stored).catch(() => ({}));
      if (native.nativeCalendarEventId || native.localNotificationId) {
        await updateEvent(stored.id, { native_calendar_event_id: native.nativeCalendarEventId || null, local_notification_id: native.localNotificationId ?? null });
      }
      setEvents((prev) => [...prev, { ...stored, ...native }]);
      setSelectedDate(new Date(stored.startTime));
      setAssistantSummary(`Takvime eklendi: ${commandText}`);
    } finally {
      setIsProcessingAI(false);
      setTimeout(() => {
        setAssistantSummary(undefined);
        setLiveTranscript('');
      }, 5000);
    }
  };

  // Create Team
  const handleCreateTeam = async (name: string, description: string) => {
    if (!userId) return; await createTeam(name, description); await refreshData(userId);
  };

  // Add Team Reminder
  const handleAddTeamReminder = (
    teamId: string,
    reminderData: {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      category: string;
      location?: string;
    }
  ) => {
    if (!userId) return;
    addTeamReminder(userId, teamId, reminderData).then(() => refreshData(userId)).catch((e) => setDataError(e.message));
  };

  // Save manual event
  const handleSaveManualEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!userId) throw new Error('Lütfen yeniden giriş yapın.');
    const previous = editingEvent;
    const stored = await saveEvent(userId, eventData, previous?.id);
    const native: Partial<CalendarEvent> = await syncEventToDevice({ ...stored, nativeCalendarEventId: previous?.nativeCalendarEventId, localNotificationId: previous?.localNotificationId }).catch((error) => { setDataError(`Etkinlik kaydedildi; cihaz senkronu yapılamadı: ${error.message}`); return {}; });
    if (native.nativeCalendarEventId || native.localNotificationId) await updateEvent(stored.id, { native_calendar_event_id: native.nativeCalendarEventId || null, local_notification_id: native.localNotificationId ?? null });
    const complete = { ...stored, ...native };
    setEvents((items) => previous ? items.map((item) => item.id === previous.id ? complete : item) : [...items, complete]);
    setEditingEvent(null);
  };

  const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), selectedDate));
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const dateHeaderStr = selectedDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  if (authLoading) return <div className="app-shell min-h-[100dvh] flex items-center justify-center" style={{ backgroundColor: currentTheme.bg, color: currentTheme.accent }}>NotyAI yükleniyor…</div>;
  if (!userId) return <AuthScreen theme={currentTheme} />;

  return (
    <div
      className="app-shell flex flex-col transition-colors duration-300 font-sans selection:bg-cyan-500/30"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Main Navigation Bar */}
      <header
        className="app-topbar sticky top-0 z-30 py-3 border-b flex items-center justify-between gap-2 backdrop-blur-md"
        style={{
          backgroundColor: `${currentTheme.panel}E6`,
          borderColor: currentTheme.border,
        }}
      >
        {/* Brand Logo & Name */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl flex items-center justify-center font-black tracking-tighter text-lg shadow-lg"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.bg,
              boxShadow: `0 0 20px ${currentTheme.accent}40`,
            }}
          >
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: currentTheme.textPrimary }}>
                NOTY<span style={{ color: currentTheme.accent }}>AI</span>
              </h1>
              <span
                className="app-pro-badge text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${currentTheme.accent}20`,
                  color: currentTheme.accent,
                }}
              >
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium hidden sm:block" style={{ color: currentTheme.textSubtle }}>
              {profile?.publicId || 'Ses Odaklı Akıllı Ajanda & Yerel Takvim'}
            </p>
          </div>
        </div>

        {/* Center Current Date Indicator (Desktop) */}
        <div
          className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            color: currentTheme.accent,
          }}
        >
          <CalendarIcon size={14} />
          <span>{dateHeaderStr}</span>
        </div>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Notifications Button with Badge */}
          <button
            id="notifications-btn"
            onClick={() => setIsNotificationOpen(true)}
            aria-label="Bildirimler"
            className="relative p-2.5 rounded-2xl transition-all hover:scale-105"
            style={{
              backgroundColor: currentTheme.card,
              color: currentTheme.textPrimary,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-black animate-pulse"
                style={{ backgroundColor: currentTheme.accent }}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Ekip & Ortak Çalışma Alanı Button */}
          <button
            id="team-workspace-btn"
            onClick={() => setIsTeamWorkspaceOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: currentTheme.card,
              color: currentTheme.textPrimary,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <Users size={16} style={{ color: currentTheme.accent }} />
            <span className="hidden sm:inline">Ekiplerim ({teams.length})</span>
          </button>

          {/* Split / Single View Layout Toggle */}
          <button
            id="toggle-layout-btn"
            onClick={() => setIsSplitLayout(!isSplitLayout)}
            title={isSplitLayout ? 'Mobil Tek Akış Görünümü' : 'Geniş Panel / Tablet Görünümü'}
            className="hidden lg:block p-2.5 rounded-2xl transition-all hover:scale-105"
            style={{
              backgroundColor: currentTheme.card,
              color: isSplitLayout ? currentTheme.accent : currentTheme.textMuted,
              border: `1px solid ${isSplitLayout ? currentTheme.accent : currentTheme.border}`,
            }}
          >
            {isSplitLayout ? <Columns size={18} /> : <Smartphone size={18} />}
          </button>

          {/* Add Event Button */}
          <button
            id="add-event-btn"
            onClick={() => {
              setEditingEvent(null);
              setIsEventModalOpen(true);
            }}
            aria-label="Randevu Ekle"
            className="flex items-center gap-1 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-105 shadow-md"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.bg,
            }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Randevu Ekle</span>
          </button>

          {/* Settings Modal Button */}
          <button
            id="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Ayarlar"
            className="p-2.5 rounded-2xl transition-all hover:scale-105"
            style={{
              backgroundColor: currentTheme.card,
              color: currentTheme.textMuted,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <Settings size={18} />
          </button>
          <button onClick={() => supabase.auth.signOut()} aria-label="Çıkış yap" className="p-2.5 rounded-2xl" style={{ backgroundColor: currentTheme.card, color: currentTheme.textMuted, border: `1px solid ${currentTheme.border}` }}><LogOut size={18}/></button>
        </div>
      </header>

      {dataError && <button onClick={() => setDataError('')} className="mx-4 mt-2 p-2 rounded-xl text-xs text-left" style={{ backgroundColor: currentTheme.card, color: currentTheme.warning }}>{dataError}</button>}

      {/* Live Transcript & Processing Status Overlay */}
      <LiveTranscriptOverlay
        isListening={isListening}
        isProcessingAI={isProcessingAI}
        transcript={liveTranscript}
        assistantSummary={assistantSummary}
        theme={currentTheme}
      />

      {/* Main Content: Tablet Split View or Mobile Single Stream */}
      {isSplitLayout ? (
        <TabletSplitLayout
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          theme={currentTheme}
          events={events}
          teams={teams}
          dailyBriefing={dailyBriefing}
          isProcessingAI={isProcessingAI}
          onToggleComplete={handleToggleComplete}
          onDeleteEvent={handleDeleteEvent}
          onRescheduleEvent={handleRescheduleEvent}
          onSendCommand={handleSendCommand}
          onOpenTeamWorkspace={() => setIsTeamWorkspaceOpen(true)}
          onOpenAddEventModal={() => {
            setEditingEvent(null);
            setIsEventModalOpen(true);
          }}
        />
      ) : (
        <main className="app-mobile-content flex-1 flex flex-col max-w-3xl w-full min-w-0 mx-auto">
          {/* Weekly Interactive Flow Bar */}
          <WeeklyFlowBar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            theme={currentTheme}
            events={events}
          />

          {/* Daily Header Title */}
          <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.accent }}>
                {dateHeaderStr}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: currentTheme.textPrimary }}>
                Günün Akışı
              </h2>
            </div>

            <div
              className="px-3 py-1.5 rounded-2xl border text-xs font-bold"
              style={{
                backgroundColor: currentTheme.panel,
                borderColor: currentTheme.border,
                color: currentTheme.textPrimary,
              }}
            >
              {dayEvents.length} Randevu
            </div>
          </div>

          {/* Events Stream List */}
          <div className="flex-1 px-4 sm:px-6 pt-2">
            {dayEvents.length === 0 ? (
              <div
                className="p-8 rounded-3xl border text-center my-6 flex flex-col items-center justify-center"
                style={{
                  backgroundColor: currentTheme.panel,
                  borderColor: currentTheme.border,
                }}
              >
                <CalendarIcon size={44} style={{ color: currentTheme.textSubtle }} className="mb-2 opacity-50" />
                <h3 className="text-base font-bold mb-1" style={{ color: currentTheme.textPrimary }}>
                  Bu güne ait kayıt bulunamadı
                </h3>
                <p className="text-xs max-w-sm mb-4" style={{ color: currentTheme.textMuted }}>
                  Aşağıdaki ses butonuna basarak "Yarın 15:00 Kadıköy Noterliği" gibi komutlar verebilirsiniz.
                </p>
                <button
                  id="empty-add-event-btn"
                  onClick={() => setIsEventModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent, border: `1px solid ${currentTheme.accent}40` }}
                >
                  + Manuel Ekle
                </button>
              </div>
            ) : (
              <div className="mt-2">
                {dayEvents.map((event, index) => (
                  <TimelineEventItem
                    key={event.id}
                    event={event}
                    isLast={index === dayEvents.length - 1}
                    theme={currentTheme}
                    onToggleComplete={handleToggleComplete}
                    onDeleteEvent={handleDeleteEvent}
                    onRescheduleEvent={handleRescheduleEvent}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pinned Bottom Fluid Interaction Bar */}
          <div className="app-command-dock fixed bottom-0 left-0 right-0 z-30 pointer-events-auto">
            <FluidInteractionBar
              theme={currentTheme}
              isProcessingAI={isProcessingAI}
              onSendCommand={handleSendCommand}
              onLiveTranscriptUpdate={setLiveTranscript}
              onListeningStateChange={setIsListening}
            />
          </div>
        </main>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentTheme={themeMode}
          onThemeChange={setThemeMode}
          theme={currentTheme}
          events={events}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Team Workspace Screen */}
      {isTeamWorkspaceOpen && (
        <TeamWorkspaceScreen
          theme={currentTheme}
          teams={teams}
          friends={friends}
          pendingInvitations={pendingInvitations}
          onCreateTeam={handleCreateTeam}
          onAddTeamReminder={handleAddTeamReminder}
          onSearchUserByPublicId={findProfile}
          onInviteMember={async (teamId, publicId) => { await inviteMember(teamId, publicId); if (userId) await refreshData(userId); }}
          onRespondInvitation={async (invitationId, accept) => { await respondInvitation(invitationId, accept); if (userId) await refreshData(userId); }}
          onClose={() => setIsTeamWorkspaceOpen(false)}
        />
      )}

      {/* Event Add/Edit Modal */}
      {isEventModalOpen && (
        <EventModal
          initialEvent={editingEvent}
          defaultDate={selectedDate}
          theme={currentTheme}
          onSave={handleSaveManualEvent}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Notifications Drawer */}
      {isNotificationOpen && (
        <NotificationDrawer
          notifications={notifications}
          theme={currentTheme}
          onMarkAllRead={() => {
            markAllNotificationsRead().catch((e) => setDataError(e.message));
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
