import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/calendar_provider.dart';

class WeeklyFlowBar extends StatelessWidget {
  const WeeklyFlowBar({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);
    final calendar = Provider.of<CalendarProvider>(context);

    final now = DateTime.now();
    // Haftanın Pazartesi gününü bul
    final monday = now.subtract(Duration(days: now.weekday - 1));

    return Container(
      height: 75,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(7, (index) {
          final day = monday.add(Duration(days: index));
          final isSelected = day.year == calendar.selectedDate.year &&
              day.month == calendar.selectedDate.month &&
              day.day == calendar.selectedDate.day;

          final dayName = DateFormat('E', 'tr_TR').format(day);
          final dayNumber = day.day.toString();

          return GestureDetector(
            onTap: () => calendar.selectDate(day),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? theme.accent : theme.panel,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? theme.accent : theme.border,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayName,
                    style: TextStyle(
                      color: isSelected ? theme.bg : theme.textMuted,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dayNumber,
                    style: TextStyle(
                      color: isSelected ? theme.bg : theme.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
