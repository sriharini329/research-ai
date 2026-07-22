import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/app_notification.dart';

class NotificationDetailScreen extends StatelessWidget {
  final AppNotification item;
  const NotificationDetailScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notification')),
      body: Padding(
        padding: kPad,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 60,
              width: 60,
              decoration: BoxDecoration(
                  color: kChipBg, borderRadius: BorderRadius.circular(16)),
              child: Icon(item.icon, color: kPrimary, size: 30),
            ),
            const SizedBox(height: 18),
            Text(item.title,
                style: const TextStyle(
                    fontSize: 20, fontWeight: FontWeight.w800, color: kInk)),
            const SizedBox(height: 6),
            Text(item.time, style: const TextStyle(color: kMuted)),
            const SizedBox(height: 18),
            Text(item.body,
                style: const TextStyle(
                    fontSize: 15, height: 1.55, color: kInk)),
          ],
        ),
      ),
    );
  }
}
