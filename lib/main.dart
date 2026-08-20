import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/theme/theme_provider.dart';
import 'core/providers/calendar_provider.dart';
import 'core/providers/voice_provider.dart';
import 'core/services/notification_service.dart';
import 'ui/screens/responsive_layout.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('tr_TR', null);

  // Bildirim Servisini Başlat (00:00, 07:00 ve 1 saat öncesi alarmları)
  final notificationService = NotificationService();
  await notificationService.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => CalendarProvider()),
        ChangeNotifierProvider(create: (_) => VoiceProvider()),
      ],
      child: const NotyAIApp(),
    ),
  );
}

class NotyAIApp extends StatelessWidget {
  const NotyAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      title: 'NotyAI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: theme.bg,
        fontFamily: 'Roboto',
      ),
      home: const ResponsiveLayout(),
    );
  }
}
