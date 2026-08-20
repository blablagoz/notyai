import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/calendar_provider.dart';
import '../../core/providers/voice_provider.dart';
import '../widgets/timeline_event_item.dart';
import '../widgets/fluid_interaction_bar.dart';
import '../widgets/weekly_flow_bar.dart';
import 'settings_modal.dart';

class TabletMainScreen extends StatelessWidget {
  const TabletMainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);
    final calendar = Provider.of<CalendarProvider>(context);
    final voice = Provider.of<VoiceProvider>(context);

    final selectedDateStr = DateFormat('d MMMM yyyy, EEEE', 'tr_TR').format(calendar.selectedDate);

    return Scaffold(
      backgroundColor: theme.bg,
      body: SafeArea(
        child: Row(
          children: [
            // ====================================================
            // SOL PANEL (Master - %38 Genişlik): Takvim, Özet, AI Boşluk Analizi
            // ====================================================
            Container(
              width: 360,
              decoration: BoxDecoration(
                color: theme.panel,
                border: Border(right: BorderSide(color: theme.border, width: 1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Üst Logo & Tablet Ayarlar Butonu
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: theme.accent.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(Icons.blur_on_rounded, color: theme.accent, size: 24),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              "NotyAI",
                              style: TextStyle(
                                color: theme.textPrimary,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: Icon(Icons.tune_rounded, color: theme.textMuted, size: 22),
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

                  // Haftalık Mini Seçici
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: WeeklyFlowBar(),
                  ),

                  const SizedBox(height: 16),

                  // AI Akıllı Boşluk Analizi Kartı (Öğrenci & Yoğun Çalışanlar İçin)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: theme.card,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: theme.accent.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.auto_awesome_rounded, color: theme.accent, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                "Yapay Zeka Boşluk Analizi",
                                style: TextStyle(
                                  color: theme.accent,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            "Bugün 10:30 - 14:00 arası 3.5 saatlik kesintisiz odaklanma pencereniz var.",
                            style: TextStyle(color: theme.textPrimary, fontSize: 13, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const Spacer(),

                  // Tablet Kısayol İpuçları (Öğrenciler için Klavye Desteği)
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: theme.bg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: theme.border),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.keyboard_outlined, color: theme.textSubtle, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              "Tablet İpucu: Boşluk veya 'K' tuşuna basarak klavyeden hızlı komut verebilirsiniz.",
                              style: TextStyle(color: theme.textSubtle, fontSize: 11, height: 1.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ====================================================
            // SAĞ PANEL (Detail - %62 Genişlik): Günün Detaylı Akışı & Geniş Zaman Çizelgesi
            // ====================================================
            Expanded(
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Sağ Üst Tarih Başlığı & İstatistikler
                      Padding(
                        padding: const EdgeInsets.fromLTRB(36, 28, 36, 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  selectedDateStr.toUpperCase(),
                                  style: TextStyle(
                                    color: theme.accent,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "Günün Detaylı Akışı",
                                  style: TextStyle(
                                    color: theme.textPrimary,
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: theme.panel,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: theme.border),
                              ),
                              child: Text(
                                "${calendar.events.length} Kayıtlı Etkinlik",
                                style: TextStyle(color: theme.textPrimary, fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Zaman Çizelgesi Listesi
                      Expanded(
                        child: calendar.isLoading
                            ? Center(child: CircularProgressIndicator(color: theme.accent))
                            : calendar.events.isEmpty
                                ? Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.event_available_outlined, color: theme.textSubtle, size: 56),
                                        const SizedBox(height: 16),
                                        Text(
                                          "Bu gün için kayıtlı randevu veya ders bulunamadı.",
                                          style: TextStyle(color: theme.textMuted, fontSize: 18),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          "Tablet klavyenizden yazarak veya sesli komut vererek ekleyebilirsiniz.",
                                          style: TextStyle(color: theme.textSubtle, fontSize: 14),
                                        ),
                                      ],
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.fromLTRB(36, 10, 36, 120),
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

                  // Canlı Dinleme Overlay'i (Tablette Sağ Üstte Şık Kart)
                  if (voice.isListening && voice.liveTranscript.isNotEmpty)
                    Positioned(
                      top: 24,
                      right: 36,
                      left: 36,
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.panel.withOpacity(0.95),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: theme.accent, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: theme.accent.withOpacity(0.2),
                              blurRadius: 25,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.graphic_eq_rounded, color: theme.accent, size: 28),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "DİNLENİYOR (TÜRKÇE NLP AKTİF)...",
                                    style: TextStyle(color: theme.accent, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '"${voice.liveTranscript}"',
                                    style: TextStyle(color: theme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Alt Geniş Tablet Etkileşim Barı (Zero-UI)
                  const Positioned(
                    bottom: 0,
                    left: 20,
                    right: 20,
                    child: FluidInteractionBar(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
