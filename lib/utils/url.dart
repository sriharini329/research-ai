import 'package:shared_preferences/shared_preferences.dart';

/// Single place for the backend base URL.
/// Uses the hosted Render backend by default.
/// Supports runtime overrides using SharedPreferences.
class Url {
  static String? _customUrl;

  /// Loads custom base URL override if stored in SharedPreferences.
  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _customUrl = prefs.getString('custom_api_base_url');
    } catch (_) {
      // Ignore if SharedPreferences is unavailable
    }
  }

  /// Sets and persists a custom backend API URL override.
  static Future<void> setCustomUrl(String? newUrl) async {
    _customUrl =
        (newUrl != null && newUrl.trim().isNotEmpty) ? newUrl.trim() : null;

    try {
      final prefs = await SharedPreferences.getInstance();

      if (_customUrl != null) {
        await prefs.setString('custom_api_base_url', _customUrl!);
      } else {
        await prefs.remove('custom_api_base_url');
      }
    } catch (_) {
      // Ignore persistence errors
    }
  }

  /// Active backend API URL.
  static String get base {
    // Use custom URL if the user has set one.
    if (_customUrl != null && _customUrl!.isNotEmpty) {
      return _customUrl!;
    }

    // Default hosted backend (Render)
    return 'http://127.0.0.1:5000';
  }
}
