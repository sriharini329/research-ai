enum ReadingStatus { toRead, reading, completed }

ReadingStatus statusFromString(String? s) {
  switch (s) {
    case 'reading':
      return ReadingStatus.reading;
    case 'completed':
      return ReadingStatus.completed;
    default:
      return ReadingStatus.toRead;
  }
}

String statusToString(ReadingStatus s) {
  switch (s) {
    case ReadingStatus.reading:
      return 'reading';
    case ReadingStatus.completed:
      return 'completed';
    case ReadingStatus.toRead:
      return 'toRead';
  }
}

class Paper {
  final int id;
  final String fileName;
  String title;
  String authors;
  String year;
  String abstractText;
  String keywords;
  String content;     // only present after getPaperDetail
  String summary;
  String citations;   // only present after getPaperDetail
  String references;  // newly extracted references
  bool favorite;
  ReadingStatus status;

  Paper({
    required this.id,
    required this.fileName,
    required this.title,
    required this.authors,
    required this.year,
    this.abstractText = '',
    this.keywords = '',
    this.content = '',
    this.summary = '',
    this.citations = '',
    this.references = '',
    this.favorite = false,
    this.status = ReadingStatus.toRead,
  });

  factory Paper.fromJson(Map<String, dynamic> j) => Paper(
        id: j['id'] as int,
        fileName: (j['file_name'] ?? '').toString(),
        title: (j['title'] ?? '').toString(),
        authors: (j['authors'] ?? '').toString(),
        year: (j['year'] ?? '').toString(),
        abstractText: (j['abstract'] ?? '').toString(),
        keywords: (j['keywords'] ?? '').toString(),
        content: (j['content'] ?? '').toString(),
        summary: (j['summary'] ?? '').toString(),
        citations: (j['citations'] ?? '').toString(),
        references: (j['references'] ?? '').toString(),
        favorite: j['is_favorite'] == true,
        status: statusFromString(j['status'] as String?),
      );

  String get citationLine => '$authors${year.isNotEmpty ? ", $year" : ""}';
}
