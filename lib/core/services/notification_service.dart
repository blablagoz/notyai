import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'package:flutter_timezone/flutter_timezone.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    tz.initializeTimeZones();
    final String timeZoneName = await FlutterTimezone.getLocalTimezone();
    tz.setLocalLocation(tz.getLocation(timeZoneName));

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(initSettings);
  }

  // 1. Gece 00:00 Özeti Planlama (Daily Midnight Digest)
  Future<void> scheduleMidnightDigest(String summaryText) async {
    final now = tz.TZDateTime.now(tz.local);
    var scheduledDate = tz.TZDateTime(tz.local, now.year, now.month, now.day, 0, 0, 0);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    await _notificationsPlugin.zonedSchedule(
      1001,
      'NotyAI • Yeni Günün Akışı',
      summaryText,
      scheduledDate,
      _notificationDetails('daily_midnight', 'Gece Özeti'),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  // 2. Sabah 07:00 Brifingi Planlama (Daily Morning Briefing)
  Future<void> scheduleMorningBriefing(String briefingText) async {
    final now = tz.TZDateTime.now(tz.local);
    var scheduledDate = tz.TZDateTime(tz.local, now.year, now.month, now.day, 7, 0, 0);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    await _notificationsPlugin.zonedSchedule(
      1002,
      'NotyAI • Günaydın, Günün Planı',
      briefingText,
      scheduledDate,
      _notificationDetails('daily_morning', 'Sabah Brifingi'),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  // 3. Yaklaşan İşe 1 Saat Kala Uyarısı (T-60 Dynamic Alert)
  Future<void> scheduleEventOneHourBeforeAlert({
    required int eventId,
    required String title,
    required DateTime eventStartTime,
    String? location,
  }) async {
    final tzStartTime = tz.TZDateTime.from(eventStartTime, tz.local);
    final alertTime = tzStartTime.subtract(const Duration(minutes: 60));

    if (alertTime.isBefore(tz.TZDateTime.now(tz.local))) return;

    final locText = location != null && location.isNotEmpty ? ' ($location)' : '';

    await _notificationsPlugin.zonedSchedule(
      eventId,
      'NotyAI • 1 Saat Kaldı: $title',
      'Etkinliğiniz 1 saat içinde başlıyor$locText. Hazırlık ve yol payını unutmayın.',
      alertTime,
      _notificationDetails('event_alerts', 'Etkinlik Uyarıları'),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  NotificationDetails _notificationDetails(String channelId, String channelName) {
    return NotificationDetails(
      android: AndroidNotificationDetails(
        channelId,
        channelName,
        importance: Importance.max,
        priority: Priority.high,
        visibility: NotificationVisibility.public,
        styleInformation: const BigTextStyleInformation(''),
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
        interruptionLevel: InterruptionLevel.timeSensitive,
      ),
    );
  }
}
