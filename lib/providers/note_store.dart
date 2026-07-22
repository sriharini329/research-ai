import 'package:flutter/foundation.dart';
import 'package:research_ai/models/note.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/api_service.dart';

class NoteStore extends ChangeNotifier {
  NoteStore._();
  static final NoteStore instance = NoteStore._();

  final List<Note> _notes = [];
  bool loading = false;

  List<Note> get all => List.unmodifiable(_notes);

  Future<void> load() async {
    if (Session.userId == null) return;
    loading = true;
    notifyListeners();
    try {
      final list = await ApiService.getNotes(Session.userId!);
      _notes
        ..clear()
        ..addAll(list);
    } catch (_) {
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> add(String content,
      {int? paperId, String paperTitle = '', int colorValue = 0xFFF59E0B}) async {
    final hex = '#${(colorValue & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';
    final id = await ApiService.addNote(Session.userId!, content,
        paperId: paperId, paperTitle: paperTitle, color: hex);
    _notes.insert(
        0,
        Note(
            id: id,
            content: content,
            paperTitle: paperTitle,
            colorValue: colorValue));
    notifyListeners();
  }

  Future<void> remove(Note n) async {
    await ApiService.deleteNote(n.id);
    _notes.remove(n);
    notifyListeners();
  }
}
