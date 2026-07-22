import 'package:flutter/material.dart';
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
            onChanged: (v) => setState(() => _dataUsage = v),
          ),
          ToggleTile(
            icon: Icons.history_rounded,
            label: 'Chat History',
            sub: 'Save your chat history',
            value: _chatHistory,
            onChanged: (v) => setState(() => _chatHistory = v),
          ),
          ToggleTile(
            icon: Icons.bar_chart_rounded,
            label: 'Analytics',
            sub: 'Anonymous usage data',
            value: _analytics,
            onChanged: (v) => setState(() => _analytics = v),
          ),
        ],
      ),
    );
  }
}
