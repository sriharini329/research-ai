class Note {
  final int id;
  String content;
  String paperTitle;
  int colorValue;

  Note({
    required this.id,
    required this.content,
    this.paperTitle = '',
    this.colorValue = 0xFFF59E0B,
  });

  factory Note.fromJson(Map<String, dynamic> j) {
    final hex = (j['color'] ?? '#F59E0B').toString().replaceAll('#', '');
    int cv = 0xFFF59E0B;
    try {
      cv = int.parse('FF$hex', radix: 16);
    } catch (_) {}
    return Note(
      id: j['id'] as int,
      content: (j['content'] ?? '').toString(),
      paperTitle: (j['paper_title'] ?? '').toString(),
      colorValue: cv,
    );
  }
}
