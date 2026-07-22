import 'package:flutter/foundation.dart';
import 'package:research_ai/models/paper.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/api_service.dart';

/// API-backed cache of the user's papers. Screens listen via AnimatedBuilder
/// and call load() in initState to refresh from the backend.
class PaperStore extends ChangeNotifier {
  PaperStore._();
  static final PaperStore instance = PaperStore._();

  final List<Paper> _papers = [];
  bool loading = false;
  String? error;

  List<Paper> get all => List.unmodifiable(_papers);
  List<Paper> get favorites => _papers.where((p) => p.favorite).toList();
  List<Paper> byStatus(ReadingStatus s) =>
      _papers.where((p) => p.status == s).toList();

  Future<void> load() async {
    if (Session.userId == null) return;
    loading = true;
    error = null;
    notifyListeners();
    try {
      final list = await ApiService.getPapers(Session.userId!);
      _papers
        ..clear()
        ..addAll(list);
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  /// Adds a freshly analyzed paper to the top of the cache.
  void cacheNew(Paper p) {
    _papers.insert(0, p);
    notifyListeners();
  }

  Future<void> toggleFavorite(Paper p) async {
    final fav = await ApiService.toggleFavorite(p.id);
    p.favorite = fav;
    notifyListeners();
  }

  Future<void> setStatus(Paper p, ReadingStatus s) async {
    await ApiService.setStatus(p.id, statusToString(s));
    p.status = s;
    notifyListeners();
  }

  Future<void> remove(Paper p) async {
    await ApiService.deletePaper(p.id);
    _papers.remove(p);
    notifyListeners();
  }

  List<Paper> search(String q) {
    q = q.trim().toLowerCase();
    if (q.isEmpty) return all;
    return _papers
        .where((p) =>
            p.title.toLowerCase().contains(q) ||
            p.authors.toLowerCase().contains(q))
        .toList();
  }
}
