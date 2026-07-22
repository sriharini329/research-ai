import 'package:flutter/material.dart';
import 'package:research_ai/utils/app_theme.dart';
import 'package:research_ai/screens/splash_screen.dart';
import 'package:research_ai/screens/onboarding_screen.dart';
import 'package:research_ai/screens/signup_screen.dart';
import 'package:research_ai/screens/login_screen.dart';
import 'package:research_ai/screens/forgot_password_screen.dart';
import 'package:research_ai/screens/select_interests_screen.dart';
import 'package:research_ai/screens/main_scaffold.dart';

import 'package:research_ai/utils/url.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Url.init();
  runApp(const ResearchAIApp());
}

class ResearchAIApp extends StatelessWidget {
  const ResearchAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Research AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: '/',
      routes: {
        '/': (_) => const SplashScreen(),
        '/onboarding': (_) => const OnboardingScreen(),
        '/signup': (_) => const SignupScreen(),
        '/login': (_) => const LoginScreen(),
        '/forgot': (_) => const ForgotPasswordScreen(),
        '/interests': (_) => const SelectInterestsScreen(),
        '/main': (_) => const MainScaffold(),
      },
    );
  }
}
