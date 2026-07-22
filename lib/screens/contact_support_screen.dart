import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class ContactSupportScreen extends StatefulWidget {
  const ContactSupportScreen({super.key});
  @override
  State<ContactSupportScreen> createState() => _ContactSupportScreenState();
}

class _ContactSupportScreenState extends State<ContactSupportScreen> {
  String _subject = 'Report an issue';
  final _message = TextEditingController();
  final _subjects = const [
    'Report an issue',
    'Feature request',
    'Account help',
    'Other',
  ];

  @override
  void dispose() {
    _message.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contact Support')),
      body: SafeArea(
        child: ListView(
          padding: kPad,
          children: [
            const Text('How can we help you?',
                style: TextStyle(color: kMuted)),
            const SizedBox(height: 18),
            const Text('Subject',
                style: TextStyle(fontWeight: FontWeight.w600, color: kInk)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                  color: kSurface,
                  borderRadius: BorderRadius.circular(kRadius),
                  border: Border.all(color: kBorder)),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _subject,
                  isExpanded: true,
                  items: _subjects
                      .map((s) =>
                          DropdownMenuItem(value: s, child: Text(s)))
                      .toList(),
                  onChanged: (v) => setState(() => _subject = v!),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Message',
                style: TextStyle(fontWeight: FontWeight.w600, color: kInk)),
            const SizedBox(height: 8),
            LabeledField(
                hint: 'Describe your issue…',
                controller: _message,
                maxLines: 6),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Send Message',
              onPressed: () {
                if (_message.text.trim().isEmpty) {
                  showSnack(context, 'Please write a message', error: true);
                  return;
                }
                showSnack(context, 'Message sent. We will reply by email.');
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
