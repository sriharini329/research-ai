import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/services/auth_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _reset() async {
    if (!_email.text.contains('@')) {
      showSnack(context, 'Enter a valid email', error: true);
      return;
    }
    if (_password.text.length < 6) {
      showSnack(context, 'Password must be 6+ characters', error: true);
      return;
    }
    setState(() => _loading = true);
    final err = await AuthService()
        .resetPassword(email: _email.text, newPassword: _password.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (err != null) {
      showSnack(context, err, error: true);
    } else {
      showSnack(context, 'Password updated. Please log in.');
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot Password')),
      body: SafeArea(
        child: Padding(
          padding: kPad,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              Container(
                height: 64,
                width: 64,
                decoration: BoxDecoration(
                    color: kChipBg, borderRadius: BorderRadius.circular(18)),
                child: const Icon(Icons.lock_reset_rounded,
                    color: kPrimary, size: 32),
              ),
              const SizedBox(height: 20),
              const Text('Reset your password',
                  style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: kInk)),
              const SizedBox(height: 8),
              const Text('Enter your email and a new password.',
                  style: TextStyle(color: kMuted)),
              const SizedBox(height: 26),
              LabeledField(
                  hint: 'Email',
                  controller: _email,
                  icon: Icons.email_outlined,
                  keyboard: TextInputType.emailAddress),
              const SizedBox(height: 14),
              LabeledField(
                hint: 'New password',
                controller: _password,
                icon: Icons.lock_outline,
                obscure: _obscure,
                suffix: IconButton(
                  icon: Icon(
                      _obscure
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: kMuted, size: 20),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
              const SizedBox(height: 26),
              PrimaryButton(
                  label: 'Reset Password',
                  loading: _loading,
                  onPressed: _reset),
            ],
          ),
        ),
      ),
    );
  }
}
