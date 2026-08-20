import 'package:flutter/material.dart';
import 'main_screen.dart';
import 'tablet_main_screen.dart';

class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // 720 px ve üzeri genişliklerde Tablet Çift Panel Düzeni
        if (constraints.maxWidth >= 720) {
          return const TabletMainScreen();
        } else {
          return const MainScreen();
        }
      },
    );
  }
}
