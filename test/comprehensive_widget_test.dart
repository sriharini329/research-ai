import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:research_ai/main.dart';
import 'package:research_ai/utils/theme_provider.dart';
import 'package:research_ai/providers/notification_store.dart';
import 'package:research_ai/utils/url.dart';

Widget createWidgetUnderTest() {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ChangeNotifierProvider(create: (_) => NotificationStore()),
    ],
    child: const ResearchAIApp(),
  );
}

void main() {
  setUpAll(() async {
    // We can't use SharedPreferences easily without mocking, but Url.init() might be safe.
    try {
      await Url.init();
    } catch (e) {
      print('Url init error ignored in tests: $e');
    }
  });

  group('Comprehensive Widget Tests', () {
    testWidgets('App launches without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle(const Duration(seconds: 3));
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('Navigate to Signup Screen', (WidgetTester tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      tester.state<NavigatorState>(find.byType(Navigator)).pushNamed('/signup');
      await tester.pumpAndSettle(const Duration(seconds: 3));
      // Just check that it didn't crash
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('Navigate to Login Screen', (WidgetTester tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      tester.state<NavigatorState>(find.byType(Navigator)).pushNamed('/login');
      await tester.pumpAndSettle(const Duration(seconds: 3));
      expect(find.byType(MaterialApp), findsOneWidget);
    });
    
    testWidgets('Navigate to Main Scaffold', (WidgetTester tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      tester.state<NavigatorState>(find.byType(Navigator)).pushNamed('/main');
      await tester.pumpAndSettle(const Duration(seconds: 3));
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
