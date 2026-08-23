import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export type NativePermissionStatus = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

export interface WritableCalendar {
  id: number;
  name: string;
  displayName: string;
  accountName: string;
  accountType: string;
  accessLevel: number;
  primary: boolean;
}

export interface NativeDevicePlugin {
  requestCalendarPermission(): Promise<{ granted: boolean }>;
  requestMicrophonePermission(): Promise<{ granted: boolean }>;
  requestNotificationPermission(): Promise<{ granted: boolean }>;
  getPermissionStatus(): Promise<{
    calendar: NativePermissionStatus;
    microphone: NativePermissionStatus;
    notifications: NativePermissionStatus;
  }>;
  listWritableCalendars(): Promise<{ calendars: WritableCalendar[] }>;
  createCalendarEvent(options: {
    title: string;
    description?: string;
    location?: string;
    startAt: number;
    endAt?: number;
    timeZone?: string;
    calendarId?: number;
    reminderMinutes?: number;
  }): Promise<{ eventId: number; calendarId: number }>;
  deleteCalendarEvent(options: { eventId: number }): Promise<{ deleted: boolean }>;
  startSpeechRecognition(options?: {
    language?: string;
    prompt?: string;
    maxResults?: number;
  }): Promise<{ text: string; alternatives: string[]; cancelled: boolean }>;
}

export const NativeDevice = registerPlugin<NativeDevicePlugin>('NativeDevice');

export const isNativeAndroid = () => Capacitor.getPlatform() === 'android';

const EVENT_REMINDER_CHANNEL = 'notyai-event-reminders';

export async function prepareEventNotifications(requestExactAlarms = false) {
  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') {
    permission = await LocalNotifications.requestPermissions();
  }
  if (permission.display !== 'granted') return { granted: false, exact: false };

  if (isNativeAndroid()) {
    await LocalNotifications.createChannel({
      id: EVENT_REMINDER_CHANNEL,
      name: 'Etkinlik hatırlatmaları',
      description: 'NotyAI etkinlikleri yaklaşınca bildirim gösterir.',
      importance: 4,
      visibility: 1,
      vibration: true,
    });
  }

  let exact = true;
  if (isNativeAndroid()) {
    const exactStatus = await LocalNotifications.checkExactNotificationSetting();
    exact = exactStatus.exact_alarm === 'granted';
    if (!exact && requestExactAlarms) {
      const requested = await LocalNotifications.changeExactNotificationSetting();
      exact = requested.exact_alarm === 'granted';
    }
  }
  return { granted: true, exact };
}

export async function scheduleEventNotification(options: {
  notificationId: number;
  eventId: string;
  title: string;
  eventAt: number;
  reminderMinutes: number;
  body?: string;
}) {
  const notificationAt = options.eventAt - options.reminderMinutes * 60_000;
  if (options.eventAt <= Date.now()) {
    throw new Error('Hatırlatma zamanı geçmişte olamaz.');
  }
  const permissions = await prepareEventNotifications(false);
  if (!permissions.granted) throw new Error('Bildirim izni verilmedi.');

  // The reminder may already have passed while the event itself is still in
  // the future. In that case keep the event-time alert instead of dropping both.
  if (notificationAt <= Date.now()) {
    return LocalNotifications.schedule({
      notifications: [{
        id: options.notificationId + 1,
        title: options.title,
        body: 'Etkinlik zamanı geldi.',
        channelId: isNativeAndroid() ? EVENT_REMINDER_CHANNEL : undefined,
        schedule: { at: new Date(options.eventAt), allowWhileIdle: true },
        extra: { eventId: options.eventId, atEventTime: true },
      }],
    });
  }

  return LocalNotifications.schedule({
    notifications: [
      {
        id: options.notificationId,
        title: options.title,
        body: options.body ?? `Etkinliğe ${options.reminderMinutes} dakika kaldı.`,
        channelId: isNativeAndroid() ? EVENT_REMINDER_CHANNEL : undefined,
        schedule: {
          at: new Date(notificationAt),
          allowWhileIdle: true,
        },
        extra: { eventId: options.eventId },
      },
      {
        id: options.notificationId + 1,
        title: options.title,
        body: 'Etkinlik zamanı geldi.',
        channelId: isNativeAndroid() ? EVENT_REMINDER_CHANNEL : undefined,
        schedule: { at: new Date(options.eventAt), allowWhileIdle: true },
        extra: { eventId: options.eventId, atEventTime: true },
      },
    ],
  });
}

export async function cancelEventNotification(notificationId: number) {
  await LocalNotifications.cancel({ notifications: [{ id: notificationId }, { id: notificationId + 1 }] });
}
