import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_colors.dart';

enum AppThemeMode { obsidian, petrol }

class ThemeProvider extends ChangeNotifier {
  AppThemeMode _currentTheme = AppThemeMode.obsidian;

  AppThemeMode get currentTheme => _currentTheme;

  Color get bg => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianBg : AppColors.petrolBg;
  Color get panel => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianPanel : AppColors.petrolPanel;
  Color get card => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianCard : AppColors.petrolCard;
  Color get border => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianBorder : AppColors.petrolBorder;
  Color get accent => _currentTheme == AppThemeMode.obsidian ? AppColors.cyberTurquoise : AppColors.mintTurquoise;
  Color get warning => _currentTheme == AppThemeMode.obsidian ? AppColors.cyberAmber : AppColors.petrolGold;
  Color get textPrimary => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianTextWhite : AppColors.petrolTextIvory;
  Color get textMuted => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianTextMuted : AppColors.petrolTextSage;
  Color get textSubtle => _currentTheme == AppThemeMode.obsidian ? AppColors.obsidianTextSubtle : AppColors.petrolTextSubtle;

  ThemeProvider() {
    _loadTheme();
  }

  void toggleTheme() async {
    _currentTheme = _currentTheme == AppThemeMode.obsidian ? AppThemeMode.petrol : AppThemeMode.obsidian;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('app_theme', _currentTheme.name);
  }

  void setTheme(AppThemeMode mode) async {
    _currentTheme = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('app_theme', _currentTheme.name);
  }

  void _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('app_theme');
    if (saved != null) {
      _currentTheme = saved == 'petrol' ? AppThemeMode.petrol : AppThemeMode.obsidian;
      notifyListeners();
    }
  }
}
