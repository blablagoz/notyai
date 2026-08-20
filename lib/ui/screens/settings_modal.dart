import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';

class SettingsModal extends StatelessWidget {
  const SettingsModal({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.panel,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            "Uygulama Tercihleri",
            style: TextStyle(color: theme.textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Text(
            "TEMA SEÇİMİ",
            style: TextStyle(color: theme.textSubtle, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => theme.setTheme(AppThemeMode.obsidian),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D1014),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: theme.currentTheme == AppThemeMode.obsidian ? const Color(0xFF00F2DE) : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: const Center(
                      child: Text(
                        "Obsidyen Titanyum",
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () => theme.setTheme(AppThemeMode.petrol),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF091212),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: theme.currentTheme == AppThemeMode.petrol ? const Color(0xFF10F0D2) : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: const Center(
                      child: Text(
                        "Gece Petrolü",
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            "BİLDİRİM MİMARİSİ",
            style: TextStyle(color: theme.textSubtle, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
          ),
          const SizedBox(height: 8),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text("Gece 00:00 Günün Özeti", style: TextStyle(color: theme.textPrimary, fontSize: 15)),
            subtitle: Text("Kilit ekranında sabit brifing", style: TextStyle(color: theme.textMuted, fontSize: 12)),
            trailing: Icon(Icons.check_circle_rounded, color: theme.accent),
          ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text("Sabah 07:00 Güne Başlama", style: TextStyle(color: theme.textPrimary, fontSize: 15)),
            subtitle: Text("Yukarıdan düşen sesli banner", style: TextStyle(color: theme.accent)),
            trailing: Icon(Icons.check_circle_rounded, color: theme.accent),
          ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text("T-60 Dakika Öncesi Hatırlatıcı", style: TextStyle(color: theme.textPrimary, fontSize: 15)),
            subtitle: Text("Yol ve hazırlık tamponu", style: TextStyle(color: theme.textMuted, fontSize: 12)),
            trailing: Icon(Icons.check_circle_rounded, color: theme.accent),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
