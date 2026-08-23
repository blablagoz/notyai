import { CalendarEvent } from '../types';
import { cancelEventNotification, isNativeAndroid, NativeDevice, scheduleEventNotification } from './native';

function notificationIdFor(eventId: string) {
  let hash = 17;
  for (const char of eventId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return (Math.abs(hash) % 1_000_000_000) * 2 + 10;
}

export async function removeEventFromDevice(event: CalendarEvent) {
  if (event.localNotificationId) await cancelEventNotification(event.localNotificationId).catch(() => undefined);
  if (isNativeAndroid() && event.nativeCalendarEventId) {
    await NativeDevice.deleteCalendarEvent({ eventId: Number(event.nativeCalendarEventId) }).catch(() => undefined);
  }
}

export async function syncEventToDevice(event: CalendarEvent): Promise<Pick<CalendarEvent, 'nativeCalendarEventId' | 'localNotificationId'>> {
  await removeEventFromDevice(event);
  const result: Pick<CalendarEvent, 'nativeCalendarEventId' | 'localNotificationId'> = {};
  const notificationId = notificationIdFor(event.id);
  if (new Date(event.startTime).getTime() > Date.now() + event.reminderMinutesBefore * 60_000) {
    await scheduleEventNotification({ notificationId, eventId: event.id, title: event.title,
      eventAt: new Date(event.startTime).getTime(), reminderMinutes: event.reminderMinutesBefore,
      body: event.location ? `${event.location} • ${event.reminderMinutesBefore} dakika kaldı.` : undefined });
    result.localNotificationId = notificationId;
  }
  if (isNativeAndroid()) {
    const permission = await NativeDevice.requestCalendarPermission();
    if (permission.granted) {
      const calendars = await NativeDevice.listWritableCalendars();
      const created = await NativeDevice.createCalendarEvent({ title: event.title, description: event.description,
        location: event.location, startAt: new Date(event.startTime).getTime(), endAt: new Date(event.endTime).getTime(),
        calendarId: calendars.calendars.find((c) => c.primary)?.id || calendars.calendars[0]?.id,
        reminderMinutes: event.reminderMinutesBefore, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      result.nativeCalendarEventId = String(created.eventId);
    }
  }
  return result;
}
