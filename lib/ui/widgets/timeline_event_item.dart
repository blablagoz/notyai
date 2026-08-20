import 'package:flutter/material.dart';
import 'package:device_calendar/device_calendar.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/calendar_provider.dart';

class TimelineEventItem extends StatelessWidget {
  final Event event;
  final bool isLast;
  final ThemeProvider theme;

  const TimelineEventItem({
    super.key,
    required this.event,
    required this.isLast,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final calendarProvider = Provider.of<CalendarProvider>(context);
    final isCompleted = calendarProvider.isEventCompleted(event.eventId);

    final start = event.start != null ? DateFormat('HH:mm').format(event.start!) : '--:--';
    final end = event.end != null ? DateFormat('HH:mm').format(event.end!) : '--:--';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sol Çizgi & Durum İkonu
        SizedBox(
          width: 50,
          child: Column(
            children: [
              Container(
                width: 16,
                height: 16,
                margin: const EdgeInsets.only(top: 4),
                decoration: BoxDecoration(
                  color: isCompleted ? Colors.green : theme.accent,
                  shape: BoxShape.circle,
                  border: Border.all(color: theme.bg, width: 2),
                ),
                child: isCompleted
                    ? const Icon(Icons.check, size: 10, color: Colors.black)
                    : null,
              ),
              if (!isLast)
                Container(
                  width: 2,
                  height: 95,
                  color: theme.border,
                ),
            ],
          ),
        ),

        // Sağ Bilgi Kartı
        Expanded(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(bottom: 20),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isCompleted ? theme.panel.withOpacity(0.6) : theme.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isCompleted ? Colors.green.withOpacity(0.3) : theme.border,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "$start - $end",
                      style: TextStyle(
                        color: isCompleted ? Colors.green : theme.accent,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        decoration: isCompleted ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    // Erken Tamamlama / Tamamlandı Butonu
                    GestureDetector(
                      onTap: () {
                        if (event.eventId != null) {
                          calendarProvider.toggleEventCompletion(event.eventId!);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isCompleted ? Colors.green.withOpacity(0.15) : theme.panel,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isCompleted ? Colors.green : theme.border,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                              size: 14,
                              color: isCompleted ? Colors.green : theme.textMuted,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isCompleted ? "Tamamlandı" : "Tamamla",
                              style: TextStyle(
                                color: isCompleted ? Colors.green : theme.textMuted,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  event.title ?? 'İsimsiz Randevu',
                  style: TextStyle(
                    color: isCompleted ? theme.textMuted : theme.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                if (event.description != null && event.description!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    event.description!,
                    style: TextStyle(color: theme.textSubtle, fontSize: 13),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
