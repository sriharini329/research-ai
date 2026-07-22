import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/auth_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/edit_profile_screen.dart';
import 'package:research_ai/screens/change_password_screen.dart';
import 'package:research_ai/screens/settings_screen.dart';
import 'package:research_ai/screens/notifications_screen.dart';
import 'package:research_ai/screens/favorites_screen.dart';
import 'package:research_ai/screens/reading_list_screen.dart';
import 'package:research_ai/screens/notes_screen.dart';
import 'package:research_ai/screens/about_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  void _go(Widget s) =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => s))
          .then((_) => setState(() {}));

  Future<void> _logout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel', style: TextStyle(color: kMuted))),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Logout',
                  style:
                      TextStyle(color: kError, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (ok == true) {
      await AuthService().logout();
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = Session.userName ?? 'Researcher';
    final email = Session.userEmail ?? '';
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: kInk),
            onPressed: () => _go(const NotificationsScreen()),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: kPad,
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    height: 90,
                    width: 90,
                    decoration: BoxDecoration(
                        gradient: kViolet, shape: BoxShape.circle),
                    child: Center(
                      child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'R',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.w800)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(name,
                      style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: kInk)),
                  const SizedBox(height: 4),
                  Text(email, style: const TextStyle(color: kMuted)),
                ],
              ),
            ),
            const SizedBox(height: 26),
            const SectionTitle('Account'),
            MenuTile(
                icon: Icons.edit_outlined,
                label: 'Edit Profile',
                onTap: () => _go(const EditProfileScreen())),
            MenuTile(
                icon: Icons.lock_outline,
                label: 'Change Password',
                onTap: () => _go(const ChangePasswordScreen())),
            const SectionTitle('Library'),
            MenuTile(
                icon: Icons.favorite_border,
                label: 'Favorites',
                onTap: () => _go(const FavoritesScreen())),
            MenuTile(
                icon: Icons.bookmark_border_rounded,
                label: 'Reading List',
                onTap: () => _go(const ReadingListScreen())),
            MenuTile(
                icon: Icons.sticky_note_2_outlined,
                label: 'Notes & Highlights',
                onTap: () => _go(const NotesScreen())),
            const SectionTitle('More'),
            MenuTile(
                icon: Icons.settings_outlined,
                label: 'Settings',
                onTap: () => _go(const SettingsScreen())),
            MenuTile(
                icon: Icons.info_outline,
                label: 'About Research AI',
                onTap: () => _go(const AboutScreen())),
            const SizedBox(height: 8),
            MenuTile(
                icon: Icons.logout_rounded,
                label: 'Logout',
                danger: true,
                onTap: _logout),
          ],
        ),
      ),
    );
  }
}
