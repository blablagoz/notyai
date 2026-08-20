import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/models/team_model.dart';

class TeamWorkspaceScreen extends StatefulWidget {
  const TeamWorkspaceScreen({super.key});

  @override
  State<TeamWorkspaceScreen> createState() => _TeamWorkspaceScreenState();
}

class _TeamWorkspaceScreenState extends State<TeamWorkspaceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);

    return Scaffold(
      backgroundColor: theme.bg,
      appBar: AppBar(
        backgroundColor: theme.panel,
        elevation: 0,
        title: Text(
          "İşbirliği & Ekipler",
          style: TextStyle(color: theme.textPrimary, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: theme.accent,
          labelColor: theme.accent,
          unselectedLabelColor: theme.textMuted,
          tabs: const [
            Tab(icon: Icon(Icons.groups_rounded), text: "Ekiplerim (Teams)"),
            Tab(icon: Icon(Icons.person_add_rounded), text: "Arkadaşlarım"),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. EKİPLERİM SEKMESİ (Microsoft Teams Mantığı)
          _buildTeamsTab(theme),

          // 2. ARKADAŞLARIM SEKMESİ (Salt Okunur Paylaşım)
          _buildFriendsTab(theme),
        ],
      ),
    );
  }

  Widget _buildTeamsTab(ThemeProvider theme) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Bilgi Kartı
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.panel,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: theme.border),
          ),
          child: Row(
            children: [
              Icon(Icons.admin_panel_settings_rounded, color: theme.accent, size: 28),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Yönetici Odaklı Ekip Alanı",
                      style: TextStyle(color: theme.textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Ekip yöneticisi görevleri ve hatırlatıcıları ekler; tüm çalışanlar telefonlarından canlı takip eder.",
                      style: TextStyle(color: theme.textMuted, fontSize: 12, height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Ekip Oluştur Butonu (Yetkili)
        ElevatedButton.icon(
          onPressed: () {
            _showCreateTeamDialog(theme);
          },
          icon: const Icon(Icons.add_rounded),
          label: const Text("Yeni Ekip Kur (Yönetici Ol)"),
          style: ElevatedButton.styleFrom(
            backgroundColor: theme.accent,
            foregroundColor: theme.bg,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ),

        const SizedBox(height: 24),
        Text("AKTİF EKİPLERİNİZ", style: TextStyle(color: theme.textSubtle, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
        const SizedBox(height: 12),

        // Örnek Ekip Kartı 1 (Kullanıcı Admin)
        _buildTeamCard(
          theme: theme,
          teamName: "Hukuk Bürosu & Dava Ekibi",
          role: "Yönetici (Admin)",
          memberCount: 6,
          remindersCount: 4,
          isAdmin: true,
        ),

        // Örnek Ekip Kartı 2 (Kullanıcı Üye)
        _buildTeamCard(
          theme: theme,
          teamName: "Hakimlik Sınavı Çalışma Grubu",
          role: "Üye (Salt Okunur)",
          memberCount: 12,
          remindersCount: 8,
          isAdmin: false,
        ),
      ],
    );
  }

  Widget _buildTeamCard({
    required ThemeProvider theme,
    required String teamName,
    required String role,
    required int memberCount,
    required int remindersCount,
    required bool isAdmin,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isAdmin ? theme.accent.withOpacity(0.4) : theme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                teamName,
                style: TextStyle(color: theme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isAdmin ? theme.accent.withOpacity(0.15) : theme.panel,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isAdmin ? theme.accent : theme.border),
                ),
                child: Text(
                  role,
                  style: TextStyle(
                    color: isAdmin ? theme.accent : theme.textMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "$memberCount Üye • $remindersCount Aktif Ekip Hatırlatıcısı",
            style: TextStyle(color: theme.textMuted, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              if (isAdmin)
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.add_alert_rounded, size: 18, color: theme.accent),
                    label: Text("Görev Ekle", style: TextStyle(color: theme.accent, fontSize: 13)),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: theme.accent),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              if (isAdmin) const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.visibility_rounded, size: 18),
                  label: const Text("Akışı Gör", style: TextStyle(fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.panel,
                    foregroundColor: theme.textPrimary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFriendsTab(ThemeProvider theme) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.panel,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: theme.border),
          ),
          child: Row(
            children: [
              Icon(Icons.visibility_outlined, color: theme.warning, size: 28),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Arkadaş Paylaşımı (Salt Okunur)",
                      style: TextStyle(color: theme.textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Arkadaşlarınızın paylaştığı ortak randevu ve hatırlatıcıları görebilirsiniz, müdahale edemezsiniz.",
                      style: TextStyle(color: theme.textMuted, fontSize: 12, height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Arkadaş Ekle Alanı
        TextField(
          style: TextStyle(color: theme.textPrimary),
          decoration: InputDecoration(
            hintText: "E-posta veya NotyAI Kullanıcı Adı ile ara...",
            hintStyle: TextStyle(color: theme.textMuted, fontSize: 14),
            prefixIcon: Icon(Icons.search_rounded, color: theme.accent),
            filled: true,
            fillColor: theme.card,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: theme.border)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: theme.border)),
          ),
        ),
      ],
    );
  }

  void _showCreateTeamDialog(ThemeProvider theme) {
    final nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.panel,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text("Yeni Ekip Kur", style: TextStyle(color: theme.textPrimary, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Bu ekibin yöneticisi siz olacaksınız. Üyeleri ekleyebilir ve tüm ekibe toplu hatırlatıcı atayabilirsiniz.",
              style: TextStyle(color: theme.textMuted, fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: nameController,
              style: TextStyle(color: theme.textPrimary),
              decoration: InputDecoration(
                hintText: "Ekip Adı (Örn: Hukuk Ekibi, Proje Grubu)",
                hintStyle: TextStyle(color: theme.textMuted, fontSize: 14),
                filled: true,
                fillColor: theme.card,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text("İptal", style: TextStyle(color: theme.textMuted)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(backgroundColor: theme.accent, foregroundColor: theme.bg),
            child: const Text("Ekibi Kur"),
          ),
        ],
      ),
    );
  }
}
