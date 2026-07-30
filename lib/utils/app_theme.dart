import 'package:flutter/material.dart';

const double kRadius = 14.0;
const EdgeInsets kPad = EdgeInsets.symmetric(horizontal: 22, vertical: 18);

const LinearGradient kViolet = LinearGradient(
  colors: [Color(0xFF7C4DFF), Color(0xFF5E35E0)],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

const LinearGradient kVioletDeep = LinearGradient(
  colors: [Color(0xFF5B2BD0), Color(0xFF3A1A8C)],
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
);

class AppTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF6F5FB),
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.light,
          seedColor: const Color(0xFF6C4AE0),
          primary: const Color(0xFF6C4AE0),
          surface: const Color(0xFFF6F5FB),
          surfaceContainer: Colors.white,
          onSurface: const Color(0xFF1E1B2E),
          onSurfaceVariant: const Color(0xFF8B8A99),
          outline: const Color(0xFFEAE7F4),
          error: const Color(0xFFE5484D),
          tertiary: const Color(0xFF2BB673), // success
        ),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF6F5FB),
          elevation: 0,
          scrolledUnderElevation: 0,
          foregroundColor: Color(0xFF1E1B2E),
          centerTitle: true,
          titleTextStyle: TextStyle(color: Color(0xFF1E1B2E), fontSize: 18, fontWeight: FontWeight.w800),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF121212),
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.dark,
          seedColor: const Color(0xFF8C6DFA),
          primary: const Color(0xFF8C6DFA),
          surface: const Color(0xFF121212),
          surfaceContainer: const Color(0xFF1E1E1E),
          onSurface: const Color(0xFFF6F5FB),
          onSurfaceVariant: const Color(0xFFA0A0A0),
          outline: const Color(0xFF333333),
          error: const Color(0xFFEF5350),
          tertiary: const Color(0xFF4ADE80), // success
        ),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF121212),
          elevation: 0,
          scrolledUnderElevation: 0,
          foregroundColor: Color(0xFFF6F5FB),
          centerTitle: true,
          titleTextStyle: TextStyle(color: Color(0xFFF6F5FB), fontSize: 18, fontWeight: FontWeight.w800),
        ),
      );
}

extension ThemeColors on BuildContext {
  bool get isDark => Theme.of(this).brightness == Brightness.dark;
  Color get kPrimary => Theme.of(this).colorScheme.primary;
  Color get kPrimaryDark => isDark ? const Color(0xFF5B2BD0) : const Color(0xFF4C2DB5);
  Color get kBackground => Theme.of(this).colorScheme.surface;
  Color get kSurface => Theme.of(this).colorScheme.surfaceContainer;
  Color get kChipBg => isDark ? const Color(0xFF2C2C2C) : const Color(0xFFF0ECFB);
  Color get kInk => Theme.of(this).colorScheme.onSurface;
  Color get kMuted => Theme.of(this).colorScheme.onSurfaceVariant;
  Color get kBorder => Theme.of(this).colorScheme.outline;
  Color get kError => Theme.of(this).colorScheme.error;
  Color get kSuccess => Theme.of(this).colorScheme.tertiary;

  Color get kBlue => isDark ? const Color(0xFF60A5FA) : const Color(0xFF3B82F6);
  Color get kOrange => isDark ? const Color(0xFFFBBF24) : const Color(0xFFF59E0B);
  Color get kTeal => isDark ? const Color(0xFF2DD4BF) : const Color(0xFF14B8A6);
  Color get kPink => isDark ? const Color(0xFFF472B6) : const Color(0xFFEC4899);
}
