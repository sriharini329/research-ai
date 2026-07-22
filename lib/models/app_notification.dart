import 'package:flutter/material.dart';

class AppNotification {
  final String title;
  final String body;
  final IconData icon;
  final String time;
  AppNotification(
      {required this.title,
      required this.body,
      required this.icon,
      required this.time});
}

/// Sample notifications shown in the Notifications screen.
final List<AppNotification> kSampleNotifications = [
  AppNotification(
    icon: Icons.check_circle_outline,
    title: 'Paper processing complete',
    body: 'Your uploaded paper has been analyzed and is ready to view.',
    time: '2m ago',
  ),
  AppNotification(
    icon: Icons.lightbulb_outline,
    title: 'New citation suggestion',
    body: 'We found new references relevant to your last question.',
    time: '1h ago',
  ),
  AppNotification(
    icon: Icons.auto_awesome_outlined,
    title: 'Weekly research digest ready',
    body: 'Your personalized summary of trending papers is available.',
    time: 'Yesterday',
  ),
];
