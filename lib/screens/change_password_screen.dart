import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/models/session.dart';
import 'package:research_ai/services/api_service.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});
  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: SafeArea(
        child: ListView(
          padding: kPad,
          children: [
            const SizedBox(height: 8),
            LabeledField(
                hint: 'Current password',
                controller: _current,
                obscure: true,
                icon: Icons.lock_outline),
            const SizedBox(height: 14),
            LabeledField(
                hint: 'New password',
                controller: _next,
                obscure: true,
                icon: Icons.lock_reset_rounded),
            const SizedBox(height: 14),
            LabeledField(
                hint: 'Confirm new password',
                controller: _confirm,
                obscure: true,
                icon: Icons.lock_reset_rounded),
            const SizedBox(height: 28),
            PrimaryButton(
              label: 'Update Password',
              onPressed: () async {
                if (_next.text.length < 6) {
                  showSnack(context, 'Password must be 6+ characters',
                      error: true);
                  return;
                }
                if (_next.text != _confirm.text) {
                  showSnack(context, 'Passwords do not match', error: true);
                  return;
                }
                try {
                  await ApiService.changePassword(
                      Session.userId!, _current.text, _next.text);
                  if (context.mounted) {
                    showSnack(context, 'Password updated');
                    Navigator.pop(context);
                  }
                } catch (e) {
                  if (context.mounted) showSnack(context, e.toString(), error: true);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
