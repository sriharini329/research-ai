import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/api_service.dart';

/// Auth backed by the Flask API. Returns null on success, else an error string.
class AuthService {
  Future<String?> signUp({
    required String name,
    required String email,
    required String password,
    List<String> interests = const [],
  }) async {
    try {
      final user = await ApiService.signup(name, email, password,
          interests: interests);
      Session.setFromJson(user);
      return null;
    } on ApiException catch (e) {
      return e.message;
    } catch (_) {
      return 'Could not reach the server. Check your connection.';
    }
  }

  Future<String?> login(
      {required String email, required String password}) async {
    try {
      final user = await ApiService.login(email, password);
      Session.setFromJson(user);
      return null;
    } on ApiException catch (e) {
      return e.message;
    } catch (_) {
      return 'Could not reach the server. Check your connection.';
    }
  }

  Future<bool> tryAutoLogin() async {
    final user = await ApiService.currentUser();
    if (user == null) return false;
    Session.setFromJson(user);
    return true;
  }

  Future<String?> resetPassword(
      {required String email, required String newPassword}) async {
    try {
      await ApiService.resetPassword(email, newPassword);
      return null;
    } on ApiException catch (e) {
      return e.message;
    } catch (_) {
      return 'Could not reach the server. Check your connection.';
    }
  }

  Future<void> logout() async {
    final email = Session.userEmail;
    if (email != null) {
      try {
        await ApiService.logout(email);
      } catch (_) {}
    }
    Session.clear();
  }
}
