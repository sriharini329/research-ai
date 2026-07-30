import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/utils/support_config.dart';
import 'package:research_ai/services/api_service.dart';
import 'package:research_ai/models/session.dart';

class ContactSupportScreen extends StatefulWidget {
  const ContactSupportScreen({super.key});
  @override
  State<ContactSupportScreen> createState() => _ContactSupportScreenState();
}

class _ContactSupportScreenState extends State<ContactSupportScreen> {
  String _subject = 'Report an issue';
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _message = TextEditingController();
  bool _isLoading = false;
  final _subjects = const [
    'Report an issue',
    'Feature request',
    'Account help',
    'Other',
  ];

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _submitSupport() async {
    if (_name.text.trim().isEmpty) {
      showSnack(context, 'Please enter your name', error: true);
      return;
    }
    if (_email.text.trim().isEmpty || !_email.text.contains('@')) {
      showSnack(context, 'Please enter a valid email', error: true);
      return;
    }
    if (_message.text.trim().isEmpty) {
      showSnack(context, 'Please write a message', error: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final ticketId = await ApiService.submitSupportRequest(
        userId: Session.userId,
        name: _name.text.trim(),
        email: _email.text.trim(),
        subject: _subject,
        message: _message.text.trim(),
      );

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('Success'),
            content: Text('Support request submitted successfully.\n\nTicket ID: $ticketId\n\nWe will contact you soon.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        showSnack(context, 'Failed to submit support request: $e', error: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contact Support')),
      body: SafeArea(
        child: ListView(
          padding: kPad,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.kPrimary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(kRadius),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Support Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  Row(children: [Icon(Icons.email, size: 16, color: context.kPrimary), const SizedBox(width: 8), Text(SupportConfig.email)]),
                  const SizedBox(height: 4),
                  Row(children: [Icon(Icons.phone, size: 16, color: context.kPrimary), const SizedBox(width: 8), Text(SupportConfig.phone)]),
                  const SizedBox(height: 4),
                  Row(children: [Icon(Icons.access_time, size: 16, color: context.kPrimary), const SizedBox(width: 8), Text(SupportConfig.hours)]),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('How can we help you?', style: TextStyle(color: context.kMuted)),
            const SizedBox(height: 18),
            
            Text('Name', style: TextStyle(fontWeight: FontWeight.w600, color: context.kInk)),
            const SizedBox(height: 8),
            LabeledField(hint: 'Your Name', controller: _name),
            const SizedBox(height: 16),
            
            Text('Email', style: TextStyle(fontWeight: FontWeight.w600, color: context.kInk)),
            const SizedBox(height: 8),
            LabeledField(hint: 'Your Email', controller: _email, keyboard: TextInputType.emailAddress),
            const SizedBox(height: 16),
            
            Text('Subject', style: TextStyle(fontWeight: FontWeight.w600, color: context.kInk)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                  color: context.kSurface,
                  borderRadius: BorderRadius.circular(kRadius),
                  border: Border.all(color: context.kBorder)),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _subject,
                  isExpanded: true,
                  items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                  onChanged: (v) => setState(() => _subject = v!),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text('Message', style: TextStyle(fontWeight: FontWeight.w600, color: context.kInk)),
            const SizedBox(height: 8),
            LabeledField(hint: 'Describe your issue…', controller: _message, maxLines: 6),
            const SizedBox(height: 24),
            PrimaryButton(
              label: _isLoading ? 'Sending...' : 'Send Message',
              onPressed: _isLoading ? () {} : _submitSupport,
            ),
          ],
        ),
      ),
    );
  }
}
