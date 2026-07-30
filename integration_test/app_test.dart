import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:research_ai/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('End-to-End Integration Tests', () {
    testWidgets('App starts and navigates successfully', (WidgetTester tester) async {
      app.main();
      
      // Wait for app to render
      await tester.pumpAndSettle(const Duration(seconds: 3));
      
      // We expect the app to have launched. Find MaterialApp
      expect(find.byType(MaterialApp), findsOneWidget);
      
      // Try to push to login route to see if navigation works in real runtime
      final BuildContext context = tester.element(find.byType(Navigator));
      Navigator.of(context).pushNamed('/login');
      await tester.pumpAndSettle(const Duration(seconds: 3));
      
      // Verify login screen elements
      expect(find.text('Log In'), findsWidgets);
    });
  });
}
