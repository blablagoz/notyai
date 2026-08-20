class ParsedEventModel {
  final String title;
  final DateTime startTime;
  final DateTime endTime;
  final int reminderMinutesBefore;
  final String category;
  final String? location;
  final String? description;
  final bool isReschedule;

  ParsedEventModel({
    required this.title,
    required this.startTime,
    required this.endTime,
    this.reminderMinutesBefore = 60,
    this.category = 'Genel',
    this.location,
    this.description,
    this.isReschedule = false,
  });

  factory ParsedEventModel.fromJson(Map<String, dynamic> json) {
    DateTime now = DateTime.now();
    DateTime parsedStart = json['start_time'] != null
        ? DateTime.tryParse(json['start_time'].toString()) ?? now.add(const Duration(hours: 1))
        : now.add(const Duration(hours: 1));

    DateTime parsedEnd = json['end_time'] != null
        ? DateTime.tryParse(json['end_time'].toString()) ?? parsedStart.add(const Duration(hours: 1))
        : parsedStart.add(const Duration(hours: 1));

    return ParsedEventModel(
      title: json['title'] ?? 'Yeni Etkinlik',
      startTime: parsedStart,
      endTime: parsedEnd,
      reminderMinutesBefore: json['reminder_minutes_before'] ?? 60,
      category: json['category'] ?? 'Genel',
      location: json['location'],
      description: json['description'],
      isReschedule: json['is_reschedule'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'reminder_minutes_before': reminderMinutesBefore,
      'category': category,
      'location': location,
      'description': description,
      'is_reschedule': isReschedule,
    };
  }
}
