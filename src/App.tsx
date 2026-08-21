import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { AppThemeMode, CalendarEvent, TeamModel, FriendShare, NotificationItem } from './types';
import { themes, ThemeColors } from './theme';
import {
  getInitialEvents,
  initialTeams,
  initialFriends,
  initialNotifications,
} from './data/initialData';
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

  // Events state
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('notyai_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialEvents();
      }
    }
    return getInitialEvents();
  });

  // Teams state
  const [teams, setTeams] = useState<TeamModel[]>(() => {
    const saved = localStorage.getItem('notyai_teams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialTeams;
      }
    }
    return initialTeams;
  });

  // Friends state
  const [friends] = useState<FriendShare[]>(initialFriends);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('notyai_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialNotifications;
      }
    }
    return initialNotifications;
  });

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

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('notyai_theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('notyai_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('notyai_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('notyai_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync window resize for layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isSplitLayout) {
        setIsSplitLayout(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSplitLayout]);

  // Fetch daily briefing when date changes
  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), selectedDate));
        const dateStr = selectedDate.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          weekday: 'long',
        });

                const res = await fetch('https://ujwlgblxgorufxikwqjp.supabase.co/functions/v1/daily-briefing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sb_publishable_4HPTSWDpGqCmDbdCHCAa-Q_V9GGFrxP',
            'apikey': 'sb_publishable_4HPTSWDpGqCmDbdCHCAa-Q_V9GGFrxP',
          },
          body: JSON.stringify({ events: dayEvents, dateStr }),
        });
        const data = await res.json();
        if (data?.briefing) {
          setDailyBriefing(data.briefing);
        }
      } catch (err) {
        console.warn('Briefing error:', err);
      }
    };

    fetchBriefing();
  }, [selectedDate, events.length]);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Toggle event completion
  const handleToggleComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e))
    );
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Reschedule event by hours
  const handleRescheduleEvent = (id: string, hours: number) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const s = new Date(e.startTime);
          const end = new Date(e.endTime);
          s.setHours(s.getHours() + hours);
          end.setHours(end.getHours() + hours);
          return { ...e, startTime: s.toISOString(), endTime: end.toISOString() };
        }
        return e;
      })
    );
    setAssistantSummary(`Etkinlik ${hours} saat sonraya ötelendi.`);
  };

  // Process NLP / Voice command
  const handleSendCommand = async (commandText: string) => {
    setIsProcessingAI(true);
    setLiveTranscript(commandText);

    try {
            const response = await fetch('https://ujwlgblxgorufxikwqjp.supabase.co/functions/v1/parse-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sb_publishable_4HPTSWDpGqCmDbdCHCAa-Q_V9GGFrxP',
          'apikey': 'sb_publishable_4HPTSWDpGqCmDbdCHCAa-Q_V9GGFrxP',
        },
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
      const start = new Date(selectedDate);
      start.setHours(start.getHours() + 1, 0, 0, 0);
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
      setEvents((prev) => [...prev, fallbackEv]);
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
  const handleCreateTeam = (name: string, description: string) => {
    const newTeam: TeamModel = {
      id: `team-${Date.now()}`,
      name,
      description,
      role: 'admin',
      memberCount: 1,
      remindersCount: 0,
      isAdmin: true,
      members: [{ id: 'me', name: 'Siz (Kurucu & Yönetici)', role: 'Yönetici (Admin)', avatar: 'ME' }],
      reminders: [],
    };
    setTeams((prev) => [...prev, newTeam]);
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
    const team = teams.find((t) => t.id === teamId);
    const newReminder = {
      id: `tr-${Date.now()}`,
      teamId,
      title: reminderData.title,
      description: reminderData.description,
      startTime: reminderData.startTime,
      endTime: reminderData.endTime,
      category: reminderData.category,
      location: reminderData.location,
      createdBy: 'me',
      createdByName: 'Av. Avni Kavalcı',
    };

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, reminders: [...t.reminders, newReminder] } : t))
    );

    // Also reflect into user's own calendar events
    const newEv: CalendarEvent = {
      id: `ev-team-${Date.now()}`,
      title: reminderData.title,
      startTime: reminderData.startTime,
      endTime: reminderData.endTime,
      reminderMinutesBefore: 60,
      category: reminderData.category,
      location: reminderData.location,
      description: `[Ekip Görevi - ${team?.name || 'Ekip'}] ${reminderData.description || ''}`,
      isCompleted: false,
      teamId,
      teamName: team?.name,
    };
    setEvents((prev) => [...prev, newEv]);
  };

  // Save manual event
  const handleSaveManualEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e))
      );
      setEditingEvent(null);
    } else {
      const newEv: CalendarEvent = {
        ...eventData,
        id: `ev-${Date.now()}`,
      };
      setEvents((prev) => [...prev, newEv]);
    }
  };

  const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), selectedDate));
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const dateHeaderStr = selectedDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300 font-sans selection:bg-cyan-500/30"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Main Navigation Bar */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 border-b flex items-center justify-between backdrop-blur-md"
        style={{
          backgroundColor: `${currentTheme.panel}E6`,
          borderColor: currentTheme.border,
        }}
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black tracking-tighter text-lg shadow-lg"
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
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${currentTheme.accent}20`,
                  color: currentTheme.accent,
                }}
              >
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium hidden sm:block" style={{ color: currentTheme.textSubtle }}>
              Ses Odaklı Akıllı Ajanda & Yerel Takvim
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
        <div className="flex items-center gap-2">
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
            className="p-2.5 rounded-2xl transition-all hover:scale-105"
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
        </div>
      </header>

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
        <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto pb-28">
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
          <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto">
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
          onCreateTeam={handleCreateTeam}
          onAddTeamReminder={handleAddTeamReminder}
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
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
