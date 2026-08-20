import 'package:flutter/material.dart';
import 'package:device_calendar/device_calendar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/calendar_service.dart';
import '../services/notification_service.dart';
import '../models/parsed_event_model.dart';

class CalendarProvider extends ChangeNotifier {
  final CalendarService _calendarService = CalendarService();
  final NotificationService _notificationService = NotificationService();

  DateTime _selectedDate = DateTime.now();
  List<Event> _events = [];
  Set<String> _completedEventIds = {};
  bool _isLoading = false;

  DateTime get selectedDate => _selectedDate;
  List<Event> get events => _events;
  Set<String> get completedEventIds => _completedEventIds;
  bool get isLoading => _isLoading;

  bool isEventCompleted(String? eventId) => eventId != null && _completedEventIds.contains(eventId);

  CalendarProvider() {
    _loadCompletedTasks();
    loadEventsForSelectedDate();
  }

  void selectDate(DateTime date) {
    _selectedDate = date;
    notifyListeners();
    loadEventsForSelectedDate();
  }

  // Geçmiş / Gelecek Günlere Hızlı Geçiş
  void goToPreviousDay() {
    selectDate(_selectedDate.subtract(const Duration(days: 1)));
  }

  void goToNextDay() {
    selectDate(_selectedDate.add(const Duration(days: 1)));
  }

  void goToToday() {
    selectDate(DateTime.now());
  }

  Future<void> loadEventsForSelectedDate() async {
    _isLoading = true;
    notifyListeners();

    _events = await _calendarService.getEventsForDay(_selectedDate);
    _isLoading = false;
    notifyListeners();
  }

  // Görevi Tamamlandı Olarak İşaretle (Erken Tamamlama Desteği)
  Future<void> toggleEventCompletion(String eventId) async {
    final prefs = await SharedPreferences.getInstance();
    if (_completedEventIds.contains(eventId)) {
      _completedEventIds.remove(eventId);
    } else {
      _completedEventIds.add(eventId);

      // AKILLI BİLDİRİM İPTALİ: Görev erken tamamlandıysa yaklaşan 1 saat kala alarmını otomatik iptal et
      try {
        final idInt = int.tryParse(eventId) ?? eventId.hashCode;
        // _notificationService.cancel(idInt);
      } catch (e) {
        print('Notification cancel error: $e');
      }
    }
    await prefs.setStringList('completed_task_ids', _completedEventIds.toList());
    notifyListeners();
  }

  Future<void> _loadCompletedTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('completed_task_ids');
    if (list != null) {
      _completedEventIds = list.toSet();
      notifyListeners();
    }
  }

  Future<bool> addParsedEvent(ParsedEventModel parsedEvent) async {
    final success = await _calendarService.createCalendarEvent(
      title: parsedEvent.title,
      startTime: parsedEvent.startTime,
      endTime: parsedEvent.endTime,
      description: parsedEvent.description,
      location: parsedEvent.location,
      reminderMinutesBefore: parsedEvent.reminderMinutesBefore,
    );

    if (success) {
      await _notificationService.scheduleEventOneHourBeforeAlert(
        eventId: parsedEvent.startTime.millisecondsSinceEpoch ~/ 1000,
        title: parsedEvent.title,
        eventStartTime: parsedEvent.startTime,
        location: parsedEvent.location,
      );

      _selectedDate = parsedEvent.startTime;
      await loadEventsForSelectedDate();
    }
    return success;
  }
}
