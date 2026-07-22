import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/app_notification.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/notification_detail_screen.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: ListView.separated(
        padding: kPad,
        itemCount: kSampleNotifications.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final n = kSampleNotifications[i];
          return AppCard(
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => NotificationDetailScreen(item: n))),
            child: Row(
              children: [
                Container(
                  height: 44,
                  width: 44,
                  decoration: BoxDecoration(
                      color: kChipBg,
                      borderRadius: BorderRadius.circular(12)),
                  child: Icon(n.icon, color: kPrimary, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(n.title,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, color: kInk)),
                      const SizedBox(height: 2),
                      Text(n.body,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style:
                              const TextStyle(color: kMuted, fontSize: 12.5)),
                    ],
                  ),
                ),
                Text(n.time,
                    style: const TextStyle(color: kMuted, fontSize: 11)),
              ],
            ),
          );
        },
      ),
    );
  }
}
