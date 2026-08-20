import 'package:device_calendar/device_calendar.dart';
import 'package:timezone/timezone.dart' as tz;

class CalendarService {
  final DeviceCalendarPlugin _deviceCalendarPlugin = DeviceCalendarPlugin();

  Future<List<Calendar>> getDeviceCalendars() async {
    var permissionsGranted = await _deviceCalendarPlugin.hasPermissions();
    if (permissionsGranted.isSuccess && !permissionsGranted.data!) {
      permissionsGranted = await _deviceCalendarPlugin.requestPermissions();
      if (!permissionsGranted.isSuccess || !permissionsGranted.data!) {
        return [];
      }
    }

    final calendarsResult = await _deviceCalendarPlugin.retrieveCalendars();
    return calendarsResult.data ?? [];
  }

  Future<String?> getDefaultCalendarId() async {
    final calendars = await getDeviceCalendars();
    if (calendars.isEmpty) return null;

    final defaultCal = calendars.firstWhere(
      (cal) => (cal.isDefault ?? false) || !(cal.isReadOnly ?? false),
      orElse: () => calendars.first,
    );
    return defaultCal.id;
  }

  Future<bool> createCalendarEvent({
    required String title,
    required DateTime startTime,
    required DateTime endTime,
    String? description,
    String? location,
    int reminderMinutesBefore = 60,
  }) async {
    final calendarId = await getDefaultCalendarId();
    if (calendarId == null) return false;

    final event = Event(
      calendarId,
      title: title,
      description: description,
      location: location,
      start: tz.TZDateTime.from(startTime, tz.local),
      end: tz.TZDateTime.from(endTime, tz.local),
      reminders: [
        Reminder(minutes: reminderMinutesBefore),
      ],
    );

    final createResult = await _deviceCalendarPlugin.createOrUpdateEvent(event);
    return createResult?.isSuccess ?? false;
  }

  Future<List<Event>> getEventsForDay(DateTime day) async {
    final calendarId = await getDefaultCalendarId();
    if (calendarId == null) return [];

    final startDate = DateTime(day.year, day.month, day.day, 0, 0, 0);
    final endDate = DateTime(day.year, day.month, day.day, 23, 59, 59);

    final eventsResult = await _deviceCalendarPlugin.retrieveEvents(
      calendarId,
      RetrieveEventsParams(
        startDate: startDate,
        endDate: endDate,
      ),
    );

    final events = eventsResult.data ?? [];
    events.sort((a, b) => (a.start ?? tz.TZDateTime.now(tz.local)).compareTo(b.start ?? tz.TZDateTime.now(tz.local)));
    return events;
  }
}
