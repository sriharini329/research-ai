import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/app_notification.dart';
import 'package:provider/provider.dart';
import 'package:research_ai/providers/notification_store.dart';
import 'package:research_ai/screens/notifications_screen.dart';

class NotificationDetailScreen extends StatelessWidget {
  final AppNotification item;
  const NotificationDetailScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: () {
              Provider.of<NotificationStore>(context, listen: false)
                  .deleteNotification(item.id);
              Navigator.pop(context);
            },
          ),
        ],
      ),
      body: Padding(
        padding: kPad,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 60,
              width: 60,
              decoration: BoxDecoration(
                  color: context.kChipBg, borderRadius: BorderRadius.circular(16)),
              child: Icon(item.icon, color: context.kPrimary, size: 30),
            ),
            const SizedBox(height: 18),
            Text(item.title,
                style: TextStyle(
                    fontSize: 20, fontWeight: FontWeight.w800, color: context.kInk)),
            const SizedBox(height: 6),
            Text(formatTimeAgo(item.time), style: TextStyle(color: context.kMuted)),
            const SizedBox(height: 18),
            Text(item.body,
                style: TextStyle(
                    fontSize: 15, height: 1.55, color: context.kInk)),
          ],
        ),
      ),
    );
  }
}
