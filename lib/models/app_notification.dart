import 'package:flutter/material.dart';

class AppNotification {
  final int id;
  final int? paperId;
  final String title;
  final String body;
  final IconData icon;
  final DateTime time;
  final bool isRead;

  AppNotification({
    required this.id,
    this.paperId,
    required this.title,
    required this.body,
    required this.icon,
    required this.time,
    required this.isRead,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    IconData getIcon(String iconStr) {
      switch (iconStr) {
        case 'Icons.check_circle_outline':
          return Icons.check_circle_outline;
        case 'Icons.login':
          return Icons.login;
        case 'Icons.person_outline':
          return Icons.person_outline;
        case 'Icons.bookmark_border':
          return Icons.bookmark_border;
        case 'Icons.delete_outline':
          return Icons.delete_outline;
        case 'Icons.chat_bubble_outline':
          return Icons.chat_bubble_outline;
        case 'Icons.quickreply_outlined':
          return Icons.quickreply_outlined;
        case 'Icons.note_add_outlined':
          return Icons.note_add_outlined;
        case 'Icons.format_quote':
          return Icons.format_quote;
        default:
          return Icons.notifications_none;
      }
    }

    return AppNotification(
      id: json['id'],
      paperId: json['paper_id'],
      title: json['title'] ?? '',
      body: json['description'] ?? '',
      icon: getIcon(json['icon'] ?? ''),
      time: DateTime.parse(json['created_at']).toLocal(),
      isRead: json['is_read'] ?? false,
    );
  }
}
