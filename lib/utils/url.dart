import 'package:flutter/foundation.dart';
import 'dart:io' as io;
import 'package:shared_preferences/shared_preferences.dart';

/// Single place for the backend base URL.
/// Supports runtime overrides and environment-based default fallbacks:
/// - Web -> http://localhost:5000
/// - Android emulator -> http://10.0.2.2:5000
/// - Desktop/Local -> http://localhost:5000
class Url {
  static String? _customUrl;

  /// Loads custom base URL override if stored in SharedPreferences.
  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _customUrl = prefs.getString('custom_api_base_url');
    } catch (_) {
      // Graceful fallback during tests or unsupported environments
    }
  }

  /// Sets and persists a custom backend API URL override.
  static Future<void> setCustomUrl(String? newUrl) async {
    _customUrl = (newUrl != null && newUrl.trim().isNotEmpty) ? newUrl.trim() : null;
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_customUrl != null) {
        await prefs.setString('custom_api_base_url', _customUrl!);
      } else {
        await prefs.remove('custom_api_base_url');
      }
    } catch (_) {}
  }

  /// Active API base URL.
  static String get base {
    if (_customUrl != null && _customUrl!.isNotEmpty) {
      return _customUrl!;
    }
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    try {
      if (io.Platform.isAndroid) {
        return 'http://10.0.2.2:5000';
      }
    } catch (_) {}
    return 'http://localhost:5000';
  }
}
