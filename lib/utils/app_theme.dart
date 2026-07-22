import 'package:flutter/material.dart';

/// ===== Violet design system (k-prefixed) =====
const Color kPrimary = Color(0xFF6C4AE0);
const Color kPrimaryDark = Color(0xFF4C2DB5);
const Color kBackground = Color(0xFFF6F5FB);
const Color kSurface = Colors.white;
const Color kChipBg = Color(0xFFF0ECFB);
const Color kInk = Color(0xFF1E1B2E);
const Color kMuted = Color(0xFF8B8A99);
const Color kBorder = Color(0xFFEAE7F4);
const Color kError = Color(0xFFE5484D);
const Color kSuccess = Color(0xFF2BB673);

// accent colors for dashboard tiles
const Color kBlue = Color(0xFF3B82F6);
const Color kOrange = Color(0xFFF59E0B);
const Color kTeal = Color(0xFF14B8A6);
const Color kPink = Color(0xFFEC4899);

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

const double kRadius = 14.0;
const EdgeInsets kPad = EdgeInsets.symmetric(horizontal: 22, vertical: 18);

class AppTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: kBackground,
        colorScheme: ColorScheme.fromSeed(
          seedColor: kPrimary,
          primary: kPrimary,
        ),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: kBackground,
          elevation: 0,
          scrolledUnderElevation: 0,
          foregroundColor: kInk,
          centerTitle: true,
          titleTextStyle: TextStyle(
              color: kInk, fontSize: 18, fontWeight: FontWeight.w800),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: kSurface,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
          hintStyle: const TextStyle(color: kMuted, fontSize: 14),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadius),
            borderSide: const BorderSide(color: kBorder),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadius),
            borderSide: const BorderSide(color: kBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadius),
            borderSide: const BorderSide(color: kPrimary, width: 1.5),
          ),
        ),
      );
}
