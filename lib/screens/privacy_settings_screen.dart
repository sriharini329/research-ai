import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class PrivacySettingsScreen extends StatefulWidget {
  const PrivacySettingsScreen({super.key});
  @override
  State<PrivacySettingsScreen> createState() => _PrivacySettingsScreenState();
}

class _PrivacySettingsScreenState extends State<PrivacySettingsScreen> {
  bool _dataUsage = false;
  bool _chatHistory = true;
  bool _analytics = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _dataUsage = prefs.getBool('privacy_data_usage') ?? false;
      _chatHistory = prefs.getBool('privacy_chat_history') ?? true;
      _analytics = prefs.getBool('privacy_analytics') ?? true;
    });
  }

  Future<void> _savePreference(String key, bool value, String successMsg) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    if (!mounted) return;
    showSnack(context, successMsg);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Settings')),
      body: ListView(
        padding: kPad,
        children: [
          ToggleTile(
            icon: Icons.tune_rounded,
            label: 'Data Usage',
            sub: 'Help improve the model',
            value: _dataUsage,
            onChanged: (v) {
              setState(() => _dataUsage = v);
              _savePreference('privacy_data_usage', v, v ? 'Data usage enabled' : 'Data usage disabled');
            },
          ),
          ToggleTile(
            icon: Icons.history_rounded,
            label: 'Chat History',
            sub: 'Save your chat history',
            value: _chatHistory,
            onChanged: (v) {
              setState(() => _chatHistory = v);
              _savePreference('privacy_chat_history', v, v ? 'Chat history enabled' : 'Chat history disabled');
            },
          ),
          ToggleTile(
            icon: Icons.bar_chart_rounded,
            label: 'Analytics',
            sub: 'Anonymous usage data',
            value: _analytics,
            onChanged: (v) {
              setState(() => _analytics = v);
              _savePreference('privacy_analytics', v, v ? 'Analytics enabled' : 'Analytics disabled');
            },
          ),
        ],
      ),
    );
  }
}
