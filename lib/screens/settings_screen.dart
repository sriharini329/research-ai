import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/privacy_settings_screen.dart';
import 'package:research_ai/screens/help_center_screen.dart';
import 'package:research_ai/screens/contact_support_screen.dart';
import 'package:research_ai/screens/feedback_screen.dart';
import 'package:research_ai/screens/terms_screen.dart';
import 'package:research_ai/screens/about_screen.dart';
import 'package:research_ai/utils/url.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;

  void _go(Widget s) =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => s));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: kPad,
        children: [
          const SectionTitle('Preferences'),
          ToggleTile(
              icon: Icons.dark_mode_outlined,
              label: 'Dark Mode',
              value: _darkMode,
              onChanged: (v) => setState(() => _darkMode = v)),
          ToggleTile(
              icon: Icons.notifications_none_rounded,
              label: 'Push Notifications',
              value: _notifications,
              onChanged: (v) => setState(() => _notifications = v)),
          MenuTile(
              icon: Icons.smart_toy_outlined,
              label: 'AI Model Settings',
              trailingText: 'Llama 3.3 70B',
              onTap: () => showSnack(context, 'Model is set in code')),
          const SectionTitle('Privacy'),
          MenuTile(
              icon: Icons.shield_outlined,
              label: 'Privacy Settings',
              onTap: () => _go(const PrivacySettingsScreen())),
          const SectionTitle('Support'),
          MenuTile(
              icon: Icons.help_outline_rounded,
              label: 'Help Center',
              onTap: () => _go(const HelpCenterScreen())),
          MenuTile(
              icon: Icons.support_agent_rounded,
              label: 'Contact Support',
              onTap: () => _go(const ContactSupportScreen())),
          MenuTile(
              icon: Icons.star_outline_rounded,
              label: 'Send Feedback',
              onTap: () => _go(const FeedbackScreen())),
          MenuTile(
              icon: Icons.description_outlined,
              label: 'Terms & Conditions',
              onTap: () => _go(const TermsScreen())),
          MenuTile(
              icon: Icons.info_outline,
              label: 'About App',
              onTap: () => _go(const AboutScreen())),
          const SectionTitle('Developer Settings'),
          MenuTile(
              icon: Icons.lan_outlined,
              label: 'API Server Base URL',
              trailingText: Url.base,
              onTap: _changeUrl),
          const SizedBox(height: 16),
          const Center(
            child: Text('Research AI · Version 1.0.0',
                style: TextStyle(color: kMuted, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  void _changeUrl() {
    final controller = TextEditingController(text: Url.base);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Configure API Server URL'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Specify the backend Flask server URL. Note: Use http://10.0.2.2:5000 for emulator, or http://<ip>:5000 for physical device.',
              style: TextStyle(fontSize: 12, color: kMuted),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Base URL',
                hintText: 'http://localhost:5000',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              final newUrl = controller.text.trim();
              final messenger = ScaffoldMessenger.of(context);
              final navigator = Navigator.of(ctx);
              await Url.setCustomUrl(newUrl.isEmpty ? null : newUrl);
              setState(() {});
              navigator.pop();
              messenger.showSnackBar(
                const SnackBar(content: Text('API Base URL updated!')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
