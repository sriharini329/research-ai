import 'dart:async';
import 'package:flutter/material.dart';
import 'package:research_ai/models/app_notification.dart';
import 'package:research_ai/services/api_service.dart';

class NotificationStore extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  bool _isLoading = false;
  Timer? _timer;
  int? _currentUserId;

  List<AppNotification> get notifications => _notifications;
  bool get isLoading => _isLoading;

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  void startPolling(int userId) {
    _currentUserId = userId;
    fetchNotifications(); // Initial fetch
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) {
      fetchNotifications();
    });
  }

  void stopPolling() {
    _timer?.cancel();
    _currentUserId = null;
  }

  Future<void> fetchNotifications() async {
    if (_currentUserId == null) return;
    try {
      if (_notifications.isEmpty) {
        _isLoading = true;
        notifyListeners();
      }
      final notifs = await ApiService.getNotifications(_currentUserId!);
      _notifications = notifs;
    } catch (e) {
      debugPrint('Failed to fetch notifications: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    if (_currentUserId == null) return;
    try {
      await ApiService.markAllAsRead(_currentUserId!);
      for (var i = 0; i < _notifications.length; i++) {
        _notifications[i] = AppNotification(
          id: _notifications[i].id,
          paperId: _notifications[i].paperId,
          title: _notifications[i].title,
          body: _notifications[i].body,
          icon: _notifications[i].icon,
          time: _notifications[i].time,
          isRead: true,
        );
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to mark all as read: $e');
    }
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      await ApiService.markAsRead(notificationId);
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        _notifications[index] = AppNotification(
          id: _notifications[index].id,
          paperId: _notifications[index].paperId,
          title: _notifications[index].title,
          body: _notifications[index].body,
          icon: _notifications[index].icon,
          time: _notifications[index].time,
          isRead: true,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to mark as read: $e');
    }
  }

  Future<void> clearAll() async {
    if (_currentUserId == null) return;
    try {
      await ApiService.clearAll(_currentUserId!);
      _notifications.clear();
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to clear notifications: $e');
    }
  }

  Future<void> deleteNotification(int notificationId) async {
    try {
      await ApiService.deleteNotification(notificationId);
      _notifications.removeWhere((n) => n.id == notificationId);
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to delete notification: $e');
    }
  }

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }
}
