class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime time;
  ChatMessage({required this.text, required this.isUser, DateTime? time})
      : time = time ?? DateTime.now();

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
        text: (j['text'] ?? '').toString(),
        isUser: (j['role'] ?? '') == 'user',
      );
}
