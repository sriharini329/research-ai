import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:research_ai/main.dart';
import 'package:research_ai/screens/splash_screen.dart';
import 'package:research_ai/screens/login_screen.dart';
import 'package:research_ai/screens/signup_screen.dart';
import 'package:research_ai/screens/onboarding_screen.dart';
import 'package:research_ai/utils/theme_provider.dart';
import 'package:research_ai/providers/notification_store.dart';
import 'package:research_ai/utils/url.dart';

void main() {
  setUpAll(() async {
    // Setup required services before tests
    await Url.init();
  });

  Widget buildTestApp(Widget screen) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => NotificationStore()),
      ],
      child: MaterialApp(
        title: 'Research AI Tests',
        themeMode: ThemeMode.light,
        home: screen,
      ),
    );
  }

  group('ResearchAI Flutter Widget Tests', () {
    testWidgets('Splash Screen renders successfully', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const SplashScreen()));
      await tester.pumpAndSettle(const Duration(seconds: 5));
      
      // Verify ResearchAI logo or text is displayed
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('Login Screen contains essential widgets', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      // Verify email and password text fields exist
      expect(find.text('Email'), findsWidgets);
      expect(find.text('Password'), findsWidgets);
      
      // Verify login button
      expect(find.text('Login'), findsWidgets);
      
      // Verify navigation links
      expect(find.text('Sign Up'), findsOneWidget);
      expect(find.text('Forgot Password?'), findsOneWidget);
    });

    testWidgets('Signup Screen contains essential form fields', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const SignupScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Full Name'), findsWidgets);
      expect(find.text('Email'), findsWidgets);
      expect(find.text('Password'), findsWidgets);
      expect(find.text('Confirm Password'), findsWidgets);
      expect(find.text('Sign Up'), findsWidgets);
    });

    testWidgets('Onboarding Screen rendering', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestApp(const OnboardingScreen()));
      await tester.pump();

      expect(find.text('Skip'), findsWidgets);
    });
  });
}


