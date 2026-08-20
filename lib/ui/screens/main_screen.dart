import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/calendar_provider.dart';
import '../../core/providers/voice_provider.dart';
import '../widgets/weekly_flow_bar.dart';
import '../widgets/timeline_event_item.dart';
import '../widgets/fluid_interaction_bar.dart';
import 'settings_modal.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);
    final calendar = Provider.of<CalendarProvider>(context);
    final voice = Provider.of<VoiceProvider>(context);

    final selectedDateStr = DateFormat('d MMMM EEEE', 'tr_TR').format(calendar.selectedDate).toUpperCase();

    return Scaffold(
      backgroundColor: theme.bg,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Üst Başlık & Ayarlar İkonu
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            selectedDateStr,
                            style: TextStyle(
                              color: theme.accent,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Günün Akışı",
                            style: TextStyle(
                              color: theme.textPrimary,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: Icon(Icons.tune_rounded, color: theme.textMuted, size: 24),
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            backgroundColor: Colors.transparent,
                            builder: (_) => const SettingsModal(),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                // Haftalık Akış Çizelgesi
                const WeeklyFlowBar(),
                const SizedBox(height: 10),

                // Zaman Çizelgesi Listesi
                Expanded(
                  child: calendar.isLoading
                      ? Center(child: CircularProgressIndicator(color: theme.accent))
                      : calendar.events.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.event_available_outlined, color: theme.textSubtle, size: 48),
                                  const SizedBox(height: 12),
                                  Text(
                                    "Bu gün için kayıtlı randevu yok.",
                                    style: TextStyle(color: theme.textMuted, fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    "Konuşarak veya yazarak hemen ekleyebilirsiniz.",
                                    style: TextStyle(color: theme.textSubtle, fontSize: 13),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                              itemCount: calendar.events.length,
                              itemBuilder: (context, index) {
                                return TimelineEventItem(
                                  event: calendar.events[index],
                                  isLast: index == calendar.events.length - 1,
                                  theme: theme,
                                );
                              },
                            ),
                ),
              ],
            ),

            // Canlı Konuşma Overlay'i (Kullanıcı konuşurken ekranda beliren şık tipografi)
            if (voice.isListening && voice.liveTranscript.isNotEmpty)
              Positioned(
                top: 140,
                left: 24,
                right: 24,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: theme.panel.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: theme.accent),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "DİNLENİYOR...",
                        style: TextStyle(color: theme.accent, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '"${voice.liveTranscript}"',
                        style: TextStyle(color: theme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),

            // AI İşleniyor Yükleme Çubuğu
            if (voice.isProcessingAI)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: LinearProgressIndicator(
                  color: theme.accent,
                  backgroundColor: Colors.transparent,
                ),
              ),

            // Alt Akışkan Etkileşim Barı (Zero-UI)
            const Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: FluidInteractionBar(),
            ),
          ],
        ),
      ),
    );
  }
}
