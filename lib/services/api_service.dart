import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:research_ai/utils/url.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/models/note.dart';
import 'package:research_ai/models/chat_message.dart';

/// Centralized HTTP layer for all backend calls (your api_service pattern).
/// Throws [ApiException] with the server's message on failure.
class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

class ApiService {
  static const Duration _timeout = Duration(seconds: 90);
  static Map<String, String> get _headers => {'Content-Type': 'application/json'};

  static dynamic _decode(http.Response r) {
    dynamic body;
    try {
      body = jsonDecode(r.body);
    } catch (_) {
      body = null;
    }
    if (r.statusCode >= 200 && r.statusCode < 300) return body;
    final msg = (body is Map && body['error'] != null)
        ? body['error'].toString()
        : 'Something went wrong (${r.statusCode}).';
    throw ApiException(msg);
  }

  static Future<dynamic> _get(String path) async {
    final r = await http
        .get(Uri.parse('${Url.base}$path'), headers: _headers)
        .timeout(_timeout);
    return _decode(r);
  }

  static Future<dynamic> _post(String path, Map<String, dynamic> body) async {
    final r = await http
        .post(Uri.parse('${Url.base}$path'),
            headers: _headers, body: jsonEncode(body))
        .timeout(_timeout);
    return _decode(r);
  }

  static Future<dynamic> _put(String path, Map<String, dynamic> body) async {
    final r = await http
        .put(Uri.parse('${Url.base}$path'),
            headers: _headers, body: jsonEncode(body))
        .timeout(_timeout);
    return _decode(r);
  }

  static Future<dynamic> _delete(String path) async {
    final r = await http
        .delete(Uri.parse('${Url.base}$path'), headers: _headers)
        .timeout(_timeout);
    return _decode(r);
  }

  // ---- Auth ----
  static Future<Map<String, dynamic>> signup(
          String name, String email, String password,
          {List<String> interests = const []}) async =>
      Map<String, dynamic>.from((await _post('/signup', {
        'name': name,
        'email': email,
        'password': password,
        'interests': interests,
      }))['user']);

  static Future<Map<String, dynamic>> login(
          String email, String password) async =>
      Map<String, dynamic>.from(
          (await _post('/login', {'email': email, 'password': password}))['user']);

  static Future<Map<String, dynamic>?> currentUser() async {
    try {
      return Map<String, dynamic>.from(await _get('/get_current_user'));
    } catch (_) {
      return null;
    }
  }

  static Future<void> logout(String email) async =>
      _post('/logout', {'email': email});

  static Future<void> resetPassword(String email, String newPassword) async =>
      _post('/reset_password', {'email': email, 'new_password': newPassword});

  // ---- Profile ----
  static Future<void> updateProfile(int userId,
          {String? name, List<String>? interests}) async =>
      _put('/profile/$userId', {
        if (name != null) 'name': name,
        if (interests != null) 'interests': interests,
      });

  static Future<void> changePassword(
          int userId, String current, String newPass) async =>
      _put('/change_password/$userId',
          {'current_password': current, 'new_password': newPass});

  // ---- Papers ----
  static Future<List<Paper>> getPapers(int userId,
      {String? status, bool favorite = false}) async {
    final qp = <String>[];
    if (status != null) qp.add('status=$status');
    if (favorite) qp.add('favorite=true');
    final query = qp.isEmpty ? '' : '?${qp.join('&')}';
    final list = await _get('/papers/$userId$query') as List;
    return list.map((e) => Paper.fromJson(e)).toList();
  }

  static Future<Paper> getPaperDetail(int paperId) async =>
      Paper.fromJson(await _get('/papers/detail/$paperId'));

  /// Save a paper the app already summarized with Groq.
  static Future<Paper> savePaper({
    required int userId,
    required String fileName,
    required String title,
    required String authors,
    required String year,
    required String content,
    required String summary,
  }) async {
    final res = await _post('/papers/analyze', {
      'user_id': userId,
      'file_name': fileName,
      'content': content,
    });
    return Paper.fromJson(res['paper']);
  }

  /// Cache the IEEE citations the app generated, so they load instantly later.
  static Future<void> saveCitations(int paperId, String citations) async =>
      _put('/papers/$paperId/citations', {'citations': citations});

  static Future<bool> toggleFavorite(int paperId) async =>
      (await _post('/papers/$paperId/favorite', {}))['is_favorite'] == true;

  static Future<void> setStatus(int paperId, String status) async =>
      _put('/papers/$paperId/status', {'status': status});

  static Future<void> deletePaper(int paperId) async =>
      _delete('/papers/$paperId');

  // ---- Chat ----
  static Future<List<ChatMessage>> getChat(int paperId) async {
    final list = await _get('/papers/$paperId/chat') as List;
    return list.map((e) => ChatMessage.fromJson(e)).toList();
  }

  static Future<void> saveChatMessage(
          int paperId, int userId, String role, String text) async =>
      _post('/papers/$paperId/chat',
          {'user_id': userId, 'role': role, 'text': text});

  // ---- Notes ----
  static Future<List<Note>> getNotes(int userId) async {
    final list = await _get('/notes/$userId') as List;
    return list.map((e) => Note.fromJson(e)).toList();
  }

  static Future<int> addNote(int userId, String content,
      {int? paperId, String paperTitle = '', String color = '#F59E0B'}) async {
    final res = await _post('/notes', {
      'user_id': userId,
      'content': content,
      if (paperId != null) 'paper_id': paperId,
      'paper_title': paperTitle,
      'color': color,
    });
    return res['id'] as int;
  }

  static Future<void> deleteNote(int noteId) async =>
      _delete('/notes/$noteId');

  // ---- Dashboard ----
  static Future<Map<String, dynamic>> dashboard(int userId) async =>
      Map<String, dynamic>.from(await _get('/dashboard/$userId'));
}
