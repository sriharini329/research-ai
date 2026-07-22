import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1100))
      ..forward();
    _boot();
  }

  Future<void> _boot() async {
    final loggedIn = await AuthService().tryAutoLogin();
    await Future.delayed(const Duration(milliseconds: 1900));
    if (!mounted) return;
    Navigator.pushReplacementNamed(
        context, loggedIn ? '/main' : '/onboarding');
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(gradient: kVioletDeep),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ScaleTransition(
              scale: CurvedAnimation(parent: _c, curve: Curves.easeOutBack),
              child: Container(
                height: 120,
                width: 120,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.white24, width: 1.5),
                ),
                child: const Icon(Icons.psychology_alt_outlined,
                    color: Colors.white, size: 64),
              ),
            ),
            const SizedBox(height: 30),
            const Text('Research AI',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            const Text('Understand Papers. Cite Confidently.',
                style: TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 44),
            FadeTransition(
              opacity: _c,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _Dot(),
                  _Dot(),
                  _Dot(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot();
  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        height: 8,
        width: 8,
        decoration:
            const BoxDecoration(color: Colors.white54, shape: BoxShape.circle),
      );
}
