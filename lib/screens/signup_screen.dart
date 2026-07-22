import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/services/auth_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});
  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _pass = TextEditingController();
  final _confirm = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _pass.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _signup() async {
    if (_name.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _pass.text.isEmpty) {
      showSnack(context, 'Please fill in all fields', error: true);
      return;
    }
    if (!_email.text.contains('@')) {
      showSnack(context, 'Enter a valid email', error: true);
      return;
    }
    if (_pass.text.length < 6) {
      showSnack(context, 'Password must be 6+ characters', error: true);
      return;
    }
    if (_pass.text != _confirm.text) {
      showSnack(context, 'Passwords do not match', error: true);
      return;
    }
    setState(() => _loading = true);
    final err = await AuthService()
        .signUp(name: _name.text, email: _email.text, password: _pass.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (err != null) {
      showSnack(context, err, error: true);
    } else {
      Navigator.pushReplacementNamed(context, '/interests');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),
              const Text('Create Account',
                  style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: kInk)),
              const SizedBox(height: 6),
              const Text('Join and start analyzing research',
                  style: TextStyle(color: kMuted)),
              const SizedBox(height: 30),
              LabeledField(hint: 'Full Name', controller: _name, icon: Icons.person_outline),
              const SizedBox(height: 14),
              LabeledField(
                  hint: 'Email',
                  controller: _email,
                  icon: Icons.email_outlined,
                  keyboard: TextInputType.emailAddress),
              const SizedBox(height: 14),
              LabeledField(
                hint: 'Password',
                controller: _pass,
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
              const SizedBox(height: 14),
              LabeledField(
                  hint: 'Confirm Password',
                  controller: _confirm,
                  icon: Icons.lock_outline,
                  obscure: _obscure),
              const SizedBox(height: 28),
              PrimaryButton(
                  label: 'Sign Up', loading: _loading, onPressed: _signup),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Already have an account? ',
                      style: TextStyle(color: kMuted)),
                  GestureDetector(
                    onTap: () =>
                        Navigator.pushReplacementNamed(context, '/login'),
                    child: const Text('Login',
                        style: TextStyle(
                            color: kPrimary, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
