import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/app_notification.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/notification_detail_screen.dart';
import 'package:provider/provider.dart';
import 'package:research_ai/providers/notification_store.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (val) {
              final store = Provider.of<NotificationStore>(context, listen: false);
              if (val == 'read') store.markAllAsRead();
              if (val == 'clear') store.clearAll();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'read',
                child: Text('Mark all as read'),
              ),
              const PopupMenuItem(
                value: 'clear',
                child: Text('Clear all', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        ],
      ),
      body: Consumer<NotificationStore>(
        builder: (context, store, _) {
          if (store.isLoading && store.notifications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (store.notifications.isEmpty) {
            return Center(
              child: Text(
                'No new notifications',
                style: TextStyle(color: context.kMuted),
              ),
            );
          }

          return ListView.separated(
            padding: kPad,
            itemCount: store.notifications.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) {
              final n = store.notifications[i];
              return AppCard(
                onTap: () async {
                  store.markAsRead(n.id);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => NotificationDetailScreen(item: n)),
                  );
                },
                child: Row(
                  children: [
                    Container(
                      height: 44,
                      width: 44,
                      decoration: BoxDecoration(
                          color: n.isRead ? context.kSurface : context.kPrimary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12)),
                      child: Icon(n.icon, color: n.isRead ? context.kMuted : context.kPrimary, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(n.title,
                              style: TextStyle(
                                  fontWeight: n.isRead ? FontWeight.w500 : FontWeight.w700, 
                                  color: context.kInk)),
                          const SizedBox(height: 2),
                          Text(n.body,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style:
                                  TextStyle(color: context.kMuted, fontSize: 12.5)),
                        ],
                      ),
                    ),
                    Text(formatTimeAgo(n.time),
                        style: TextStyle(color: context.kMuted, fontSize: 11)),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

String formatTimeAgo(DateTime time) {
  final diff = DateTime.now().difference(time);
  if (diff.inSeconds < 60) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes} minute${diff.inMinutes == 1 ? '' : 's'} ago';
  if (diff.inHours < 24) return '${diff.inHours} hour${diff.inHours == 1 ? '' : 's'} ago';
  if (diff.inDays == 1) return 'Yesterday';
  return '${diff.inDays} days ago';
}
