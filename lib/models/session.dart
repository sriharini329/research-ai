/// Static in-memory holder for the logged-in user.
class Session {
  static int? userId;
  static String? userName;
  static String? userEmail;
  static List<String> interests = [];

  static bool get isLoggedIn => userId != null;

  static void setFromJson(Map<String, dynamic> u) {
    userId = u['id'] as int?;
    userName = u['name'] as String?;
    userEmail = u['email'] as String?;
    interests = (u['interests'] as List?)?.map((e) => e.toString()).toList() ?? [];
  }

  static void clear() {
    userId = null;
    userName = null;
    userEmail = null;
    interests = [];
  }
}
