import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/services/auth_service.dart';
import 'package:research_ai/widgets/app_widgets.dart';
import 'package:research_ai/screens/forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _pass = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    _pass.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_email.text.trim().isEmpty || _pass.text.isEmpty) {
      showSnack(context, 'Please fill in all fields', error: true);
      return;
    }
    setState(() => _loading = true);
    final err =
        await AuthService().login(email: _email.text, password: _pass.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (err != null) {
      showSnack(context, err, error: true);
    } else {
      Navigator.pushReplacementNamed(context, '/main');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            children: [
              const SizedBox(height: 40),
              Container(
                height: 76,
                width: 76,
                decoration: BoxDecoration(
                    gradient: kViolet,
                    borderRadius: BorderRadius.circular(22)),
                child: const Icon(Icons.psychology_alt_outlined,
                    color: Colors.white, size: 40),
              ),
              const SizedBox(height: 24),
              const Text('Welcome Back!',
                  style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: kInk)),
              const SizedBox(height: 6),
              const Text('Login to continue',
                  style: TextStyle(color: kMuted)),
              const SizedBox(height: 32),
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
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const ForgotPasswordScreen())),
                  child: const Text('Forgot Password?',
                      style: TextStyle(
                          color: kPrimary, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 12),
              PrimaryButton(
                  label: 'Login', loading: _loading, onPressed: _login),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account? ",
                      style: TextStyle(color: kMuted)),
                  GestureDetector(
                    onTap: () =>
                        Navigator.pushReplacementNamed(context, '/signup'),
                    child: const Text('Sign Up',
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
